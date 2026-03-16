/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const pdf = require('pdf-parse');

async function readPdfs() {
    try {
        let misraBuffer = fs.readFileSync('C:\\Users\\USER\\Desktop\\MISRA-AC-SLSF-2023.pdf');
        let misraData = await pdf(misraBuffer);
        console.log("--- MISRA EXTRACT ---");
        console.log(misraData.text.substring(5000, 8000)); 
    } catch (e) {
        console.log("MISRA PDF Error object:", e);
    }

    try {
        let mabBuffer = fs.readFileSync('C:\\Users\\USER\\Desktop\\mab-guidelines-v5.pdf');
        let mabData = await pdf(mabBuffer);
        console.log("--- MAB EXTRACT ---");
        console.log(mabData.text.substring(5000, 8000));
    } catch (e) {
        console.log("MAB PDF Error object:", e);
    }
}

readPdfs();
