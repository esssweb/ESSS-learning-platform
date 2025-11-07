import prisma from "@/prisma";

const connectToDB = async () => {
  try {
    await prisma.$connect();
  } catch (error: any) {
    return new Error(error.message);
  }
};

export default connectToDB;
