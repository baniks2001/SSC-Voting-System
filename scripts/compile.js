import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create artifacts folder if it doesn't exist
const artifactsPath = path.resolve(__dirname, '../artifacts');
if (!fs.existsSync(artifactsPath)) {
    fs.mkdirSync(artifactsPath, { recursive: true });
}

// Compile contract
const contractPath = path.resolve(__dirname, '../contracts/Voting.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Voting.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

try {
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for compilation errors
    if (output.errors) {
        output.errors.forEach(err => {
            if (err.severity === 'error') {
                console.error('Compilation error:', err.formattedMessage);
                process.exit(1);
            }
        });
    }

    // Save compiled contract
    const contractName = 'Voting';
    const contractFile = output.contracts['Voting.sol'][contractName];

    if (!contractFile) {
        throw new Error('Contract not found in compilation output');
    }

    const compilationResult = {
        abi: contractFile.abi,
        bytecode: contractFile.evm.bytecode.object,
    };

    const outputPath = path.resolve(artifactsPath, contractName + '.json');
    fs.writeFileSync(outputPath, JSON.stringify(compilationResult, null, 2));

    console.log('Contract compiled successfully!');
    console.log('ABI and bytecode saved to artifacts/Voting.json');
    console.log('Contract ABI length:', compilationResult.abi.length);
    console.log('Bytecode length:', compilationResult.bytecode.length);

} catch (error) {
    console.error('Compilation failed:', error.message);
    process.exit(1);
}
