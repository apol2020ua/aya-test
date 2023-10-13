import { Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Node } from './node.class';
import { createInterface } from 'node:readline';
import { Interface } from 'readline';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entity';
import { Repository } from 'typeorm';
import { DepartmentEntity } from './entities/department.entity';
import { StatementEntity } from './entities/statement.entity';
import { DonationEntity } from './entities/donation.entity';

// hardcoded array-nodes (details explained in the answers to the questions)
const ARRAY_NODES = ['Statement', 'Employee', 'Donation', 'Rate'];

@Injectable()
export class AppService {
  private ratesMap: Record<string, number>;

  constructor(
    @InjectRepository(EmployeeEntity)
    private employee: Repository<EmployeeEntity>,
    @InjectRepository(DepartmentEntity)
    private department: Repository<DepartmentEntity>,
    @InjectRepository(StatementEntity)
    private statement: Repository<StatementEntity>,
    @InjectRepository(DonationEntity)
    private donations: Repository<DonationEntity>,
  ) {}

  async oneTimeReward() {
    const q: string = `
      SELECT e.id, e.name, e.surname, SUM(d.amount) as total_donations,
        CASE
           WHEN SUM(d.amount) >= 100 THEN (SUM(d.amount) / (SELECT SUM(amount) FROM public.donations) * 10000)
           ELSE 0
        END as one_time_reward
        FROM public.employees AS e
           LEFT JOIN public.donations d ON e.id = d.employee_id
        GROUP BY e.id
        ORDER BY total_donations
    `;
    return this.employee.query(q);
  }

  async importDatabase(): Promise<Record<string, any>> {
    /* from official node docs for read file line by line in stream
     * https://nodejs.org/api/readline.html#example-read-file-stream-line-by-line */
    const fileStream = createReadStream('dump.txt');
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    const dbJson = await this.parseDumpFile(rl);
    this.generateRatesMap(dbJson['Rates']['Rates']);
    return this.putIntoDb(dbJson);
  }

  private async putIntoDb(dbJson: Record<string, any>) {
    const employees = dbJson['E-List']['Employees'];
    // entities for inserting into db
    const entities = {
      employees: [],
      departments: [],
      statements: [],
      donations: [],
    };

    // for identify unique id->name map of departments
    const depMap = {};

    // prepare entities for insert
    employees.forEach((employee) => {
      const { id, name, surname, Department: dep, Donations: don } = employee;
      const { Statements } = employee.Salary;

      // prepare employee donations
      const donations =
        don?.map(({ id: donationId, date, amount: rawAmount }) => {
          const [sum, sign] = rawAmount.split(' ');
          const isUsd = sign === 'USD';
          const amount = isUsd ? +sum : +sum * this.getUsdRate(date, sign);
          return { id: donationId, date, amount, employee_id: id };
        }) || [];

      // prepare employee statements
      const statements = Statements.map((s) => {
        s.employee_id = id;
        return s;
      });

      entities.employees.push({ id, name, surname, department_id: dep.id });
      depMap[dep.id] = dep.name;
      entities.statements.push(...statements);
      entities.donations.push(...donations);
    });

    // prepare departments
    entities.departments = Object.entries(depMap).map(([k, v]) => ({
      id: +k,
      name: v,
    }));

    await Promise.all([
      this.employee.insert(entities.employees),
      this.department.insert(entities.departments),
      this.statement.insert(entities.statements),
      this.donations.insert(entities.donations),
    ]);

    return dbJson;
  }

  private generateRatesMap(rates) {
    // generate rates map for date-currency pairs
    this.ratesMap = rates.reduce((acc: Record<string, number>, rate) => {
      acc[`${rate.date}_${rate.sign}`] = +rate.value;
      return acc;
    }, {});
  }

  private getUsdRate(date: string, currency: string): number {
    return this.ratesMap[`${date}_${currency}`];
  }

  /**
   *  Main function for parse dump.txt file
   *
   * @param readLine
   * @private
   */
  private async parseDumpFile(
    readLine: Interface,
  ): Promise<Record<string, any>> {
    const root = new Node();
    let activeNode: Node = root;
    let prevLevel = -1;

    // helper function for go back to the parent node
    const goToParent = () => {
      /* if active node's parent is array-node, we should additionally
       *  push active node to the parent's node array */
      if (activeNode.parent.isArray) {
        activeNode.attachToParent();
      }
      activeNode = activeNode.parent;
    };

    for await (let line of readLine) {
      // skip empty lines
      if (!line.length) continue;

      // get level deepness based on the indentation
      const spacesMatch = line.match(/^\s+/);
      const level = spacesMatch?.[0].length || 0;

      line = line.trim();

      // when level goes down, we should return to the node on the previous level
      if (level < prevLevel) {
        while (activeNode.level > level - 2 && activeNode.parent) {
          goToParent();
        }
      }

      /* If line exists in list of arrays-classes we create array-node
       * Array-nodes hardcoded above (details explained in the answers to the questions) */
      if (ARRAY_NODES.includes(line)) {
        // for array-node create new array or pick already exists one
        const arr = activeNode.val[line + 's'] || [];
        activeNode.val[line + 's'] = arr;

        // create array-node that will contains list of class-objects
        const arrNode = new Node(activeNode, arr, level);

        // create object-node
        activeNode = new Node(arrNode, {}, level);
      }
      // If line starts from the Upper Case letter we create object-node
      else if (line[0].toUpperCase() === line[0]) {
        const json = {};
        activeNode.val[line] = json;
        activeNode = new Node(activeNode, json, level);
      }
      // If line starts from the lower Case letter we create object-node's parameter
      if (line[0].toLowerCase() === line[0]) {
        const [key, val] = line.split(': ');
        activeNode.val[key] = val;
      }
      prevLevel = level;
      // console.log(`Line from file: ${line} (${level})`);
    }

    // EOF last step. Go to the root node
    while (activeNode.level > 0) {
      goToParent();
    }

    return root.val;
  }
}
