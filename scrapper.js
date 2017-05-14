const fs = require('fs');
const path = require('path');
const http = require('http');

const webmLoader = async (id) => {
    const webmId = id.slice(1);
    const file = `./scrapped/${id}.webm`;

    fs.access(file, (err) => {
        if (err) {
            const stream = fs.createWriteStream(file);
            http.get({
                host: 'storage.csgoani.me',
                path: `/uploads/${webmId}.webm`,
                method: 'GET',
                headers: {
                    'Referer': `http://csgoani.me/${webmId}`,
                }
            }, (res) => {
                res.pipe(stream);
                res.on('end', (data) => {
                    console.info(`${id}.webm has been successfully downloaded`);
                });
            }, (err) => {
                console.error(`Error while downloading file ${id}.webm. Error code: ${err.code}`);
            });
        } else console.warn(`Ooops, ${id}.webm had been already downloaded!`);
    });
};

const getWebm = () => {
    http.get({ host: 'csgoani.me' }, (res) => {
        res.setEncoding('utf8');
        const id = res.headers.location.match(/\w+$/g)[0];
        console.info(`Loading ${id}.webm...`);
        webmLoader(id);
    }, (err) => {
        console.error(`Error while fetching data. Error code: ${err.code}`);
    });
};

const scrapperStart = () => {
    const interval = 1000;
    console.info(`Everything is up and running, I'm gonna download webms every ${interval/1000}s`);
    setInterval(getWebm, interval);
};

fs.access('./scrapped', fs.constants.R_OK | fs.constants.W_OK, (err) => {
    if (err) {
        fs.mkdir('./scrapped', fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if (err) {
                console.error(`Couldn't create a directory, try to execute this script with RW permissions. Error code: ${err.code}`);
                return err.code;
            } else scrapperStart();
        });
    } else scrapperStart();
});