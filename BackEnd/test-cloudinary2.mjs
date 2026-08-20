import dotenv from 'dotenv';
dotenv.config();
import cloudinary from 'cloudinary';

cloudinary.v2.config();

async function test() {
    try {
        const res = await cloudinary.v2.uploader.upload('dummy.pdf', {
            folder: 'comprobantes',
            resource_type: 'auto'
        });
        console.log('UPLOAD SUCCESS:', res);
    } catch (e) {
        console.error('UPLOAD ERROR:', e);
    }
}
import fs from 'fs';
fs.writeFileSync('dummy.pdf', '%PDF-1.4 dummy pdf');
test();
