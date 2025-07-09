const mockBankDatabase = new Map();

function verifyBankDeposit(transactionId, amount) {
  // Simulate bank deposit verification
  if (!transactionId || amount <= 0) {
    return { success: false, error: "Invalid transaction ID or amount" };
  }
  mockBankDatabase.set(transactionId, { amount, verified: true });
  return { success: true, balance: amount * 10**6 }; // Convert to 6 decimals
}

function verifyRedemption(transactionId, amount) {
  // Simulate redemption verification
  const deposit = mockBankDatabase.get(transactionId);
  if (!deposit || deposit.amount < amount || !deposit.verified) {
    return { success: false, error: "Invalid or insufficient deposit" };
  }
  mockBankDatabase.set(transactionId, { amount: deposit.amount - amount, verified: true });
  return { success: true };
}

function verifyKyc(address) {
  // Simulate KYC check (mock all addresses as compliant)
  return { success: true, address };
}

module.exports = { verifyBankDeposit, verifyRedemption, verifyKyc };
