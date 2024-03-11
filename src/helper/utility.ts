const csv = require('csv-parser');
const csvWriter = require('csv-writer');


export function writeCSV(data, path) {
    return new Promise((resolve) => {
        const csvPath = path;
        const header: any[] = []
        Object.keys(data[0]).forEach((b) => {
            header.push({ id: b, title: b })
        })

        const writer = csvWriter.createObjectCsvWriter({
            path: csvPath,
            header: header
        });

        writer.writeRecords(data).then((res) => resolve(true));
    })
}

export async function delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}