import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
//import gs from 'ghostscript4js';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class CompressionService {
  async compressFile(filePath: string) {
    const pathParsed = path.parse(filePath);
    const outputFilePath = path.join(
      pathParsed.dir,
      'compressed',
      pathParsed.name + pathParsed.ext
    );

    console.log(filePath);
    console.log(outputFilePath);

    const args = [
      '-dBATCH', // disables prompting for input pages
      '-dNOPAUSE', // does not pause between pages
      '-dPDFSETTINGS=/screen', // sets the output dpi to 72
      '-sDEVICE=pdfwrite', // output to pdf
      '-sDEFAULTPAPERSIZE=letter', // set letter size
      `-sOutputFile=${outputFilePath}`, // output file name
      `${filePath}`, // input file name
    ];

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const gs = require('ghostscript4js');
      const consoleLabel = `Compression for ${
        pathParsed.name + pathParsed.ext
      } took`;
      console.time(consoleLabel);
      await gs.execute(args).then(() => {
        console.timeEnd(consoleLabel);
        return true;
      });
    } catch (err) {
      console.log(err);
    }

    return false;
  }

  async stampFile(filePath: string, compressed: boolean, firstPageOnly = true) {
    try {
      if (path.parse(filePath).ext === '.pdf') {
        const pathParsed = path.parse(filePath);
        const consoleLabel = `Stamping for ${
          pathParsed.name + pathParsed.ext
        } took`;

        const inputFilePath = path.join(
          pathParsed.dir,
          compressed ? 'compressed' : '',
          pathParsed.name + pathParsed.ext
        );
        const uint8Array = readFileSync(inputFilePath);
        const pdfDoc = await PDFDocument.load(uint8Array);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const { height } = pages[0].getSize();
        const outputFileName = path.join(
          pathParsed.dir,
          'stamped',
          pathParsed.name + pathParsed.ext
        );
        const lastPageToStamp = firstPageOnly ? 1 : pages.length;

        console.time(consoleLabel);
        for (let i = 0; i < lastPageToStamp; i++) {
          pages[i].drawText('Some Stamped Text', {
            x: 40,
            y: height - 20,
            size: 10,
            lineHeight: 14,
            font: helveticaFont,
            color: rgb(0.95, 0.1, 0.1),
          });
        }

        const pdfBytes = await pdfDoc.save();
        writeFileSync(outputFileName, pdfBytes);
        console.timeEnd(consoleLabel);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
