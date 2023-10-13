# Answers
1. How to change the code to support different file versions?

I've tried to make a parser that works for any new file version, 
as long as the main structure of the dump file remains unchanged. 
However, I ran into a problem with arrays.
from the one side we have arrays like
```
E-List
  Employee
    ....
  Employee
    ....
```
and
```
Salary
   Statement
      ...
   Statement
   ...
```
but from the other side we also have arrays like:
```
Employee
   Donation
      ....
   Donation
      ...
```

And it's a little confusing because we don't have a clear description
of how to correctly transform arrays into JSON. For `Employees` and `Statements`
we have parent nodes `E-list` and `Salary` and I can put them in json in appropriate
fields like: `{ e-list: [Employees] }`, `{ salary: [Statements] }` but for 
`Donation`, parent node is `Employee`, and I can't put donations array directly
to `Employee` node, so if employee has only one `Donation` I can't recognize is it employee's 
array or just some separate object-field. 

Since I can't directly tell the difference between an Array-node and an
Object-node structure from the dump file, I should rely only on the task 
description and node names. As a result, I hardcoded the names of the Array's
fields in the code, so if we add a new field that is an array,
we need to add it name to the code.

2. How the import system will change if data on exchange rates disappears from
   the file, and it will need to be received asynchronously (via API)?

In the current solution, after parsing, I generate rates map (`AppService.generateRatesMap()`).
Then, we can retrieve the required rate using the function `getUsdRate(date: string, currency: string): number `.
If we switch to the API, we can simply remove `AppService.generateRatesMap` and change `getUsdRate` function
to API call

3. In the future the client may want to import files via the web interface,
   how can the system be modified to allow this?
We should just add to the NestJs Controller @FileInterceptor and appropriate
files store config (or read directly File Buffer), 
after that our `AppService.importDatabase()` function can 
read that dump info from the file in our store or from the File Buffer.
