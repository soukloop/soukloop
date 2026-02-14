
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Prisma Keys:', Object.keys(prisma));
// Also check _dmmf
// console.log('DMMF:', prisma._dmmf.datamodel.models.map(m => m.name));
