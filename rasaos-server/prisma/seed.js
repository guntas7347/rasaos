"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const client_1 = require("./generated/prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../src/lib/prisma");
async function main() {
    const adminEmail = "guntas7347@gmail.com";
    // Check if admin already exists
    const existingAdmin = await prisma_1.prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (existingAdmin) {
        console.log(`Admin with email ${adminEmail} already exists.`);
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash("admin123", 10);
    const admin = await prisma_1.prisma.user.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            role: client_1.Role.ADMIN,
            restaurantId: null,
        },
    });
    console.log(`Successfully created admin: ${admin.email}`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
