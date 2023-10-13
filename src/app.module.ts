import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm-config.service';
import { ConfigModule } from '@nestjs/config';
import { EmployeeEntity } from './entities/employee.entity';
import { DepartmentEntity } from './entities/department.entity';
import { StatementEntity } from './entities/statement.entity';
import { DonationEntity } from './entities/donation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([
      EmployeeEntity,
      DepartmentEntity,
      StatementEntity,
      DonationEntity,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
