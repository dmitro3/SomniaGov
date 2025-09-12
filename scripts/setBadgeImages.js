const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const REPUTATION_NFT_ADDRESS = process.env.VITE_REPUTATION_NFT_TESTNET;
  
  console.log("Setting badge images with account:", deployer.address);
  
  const ReputationNFT = await ethers.getContractFactory("ReputationNFT");
  const reputationNFT = ReputationNFT.attach(REPUTATION_NFT_ADDRESS);
  
  const badgeImages = {
    0: "bafybeiedi7b3ykr7uumfqpl3hnmhhw7sehbe3hxeiwqmhvifcxrmxijaf4",
    1: "bafybeia6tnst62ev3lnl4iwfcooes2rvmjhvf2vjj3czg5yrtrzxfwqx4u",
    2: "bafybeihsrkccoromkdsj7c6f53yhkojx3ruccp3pdfx5inudpx66uktntu",
    3: "bafybeibhoanqix7y3qbq2te3kvn7q4wopwerbazhl2k7oo3mlwfqiwc5bi",
    4: "bafybeihcn7znhnno2ml3fuccnrhhegwkc3mvaisnzlijvjv4mrwrvh2c6q",
    5: "bafybeic46itqakmvezkjdw2olukzjcebtmlfzitm4lrjpv7pi7m7gzw2nq",
    6: "bafybeifhh4hnjcr6olbz4dbgva7zwt42y3yevjx6hejtb37cvjqrrvgwpi",
    7: "bafybeieiw37bln5t4ocnwbasgov6ajbhezqc54kjszhpjupwrx5j6cikv4"
  };
  
  console.log("Setting badge images...");
  
  for (const [badgeType, hash] of Object.entries(badgeImages)) {
    try {
      const tx = await reputationNFT.setBadgeImage(
        parseInt(badgeType),
        hash
      );
      
      await tx.wait();
      console.log(`Set badge image for type ${badgeType}: ${hash}`);
      
    } catch (error) {
      console.error(`Failed to set image for type ${badgeType}:`, error.message);
    }
  }
  
  console.log("Badge images setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });