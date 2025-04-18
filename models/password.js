import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  const passwordWithPepper = addPepper(password);
  return await bcryptjs.hash(passwordWithPepper, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(password, hashedPassword) {
  const passwordWithPepper = addPepper(password);
  return await bcryptjs.compare(passwordWithPepper, hashedPassword);
}

function addPepper(password) {
  const pepper = process.env.PEPPER;
  const peperSize = (password.length % 9) + 1;
  const frontPepper = pepper.slice(0, peperSize);
  const backPepper = pepper.slice(peperSize, peperSize * 2);
  return frontPepper + password + backPepper;
}

const password = {
  hash,
  compare,
};

export default password;
