const axios = require('axios');
const { JSDOM } = require('jsdom');
const qs = require('querystring');

const parseStatusId = s => {
  if (s.includes('Posted')) return 'at_pickup';
  if (s.includes('Out for delivery')) return 'out_for_delivery';
  if (s.includes('Delivered')) return 'delivered';
  return 'in_transit';
};

function getTime(location, time) {
  return new Date(`${time} GMT+0900`);
}

function getTrack(trackId) {
  // Ref : https://www.ems.post/en/global-network/tracking

  return new Promise((resolve, reject) => {
    axios
      .get(
        'https://items.ems.post/api/publicTracking/track',{
          params: {
            itemId: trackId,
            language: 'EN',
          }
        }
      )
      .then(res => {
        const dom = new JSDOM(res.data);
        const { document } = dom.window;

        const table = document.querySelector('tbody');

        const error = table
          ? table.querySelector('td[class="no-results-found"]')
          : true;
        if (error) {
          reject({
            code: 404,
            message: error.textContent || 'Tracking ID Error',
          });
          return;
        }

        const shippingInformation = {
          state: { id: 'information_received', text: 'information received' },
          progresses: [],
        };

        table.querySelectorAll('tr').forEach(element => {
          const tds = element.querySelectorAll('td');

          shippingInformation.progresses.push({
            time: getTime(tds[2].textContent, tds[0].textContent),
            location: { name: tds[2].textContent },
            status: {
              id: parseStatusId(tds[1].textContent),
              text: tds[1].textContent,
            },
          });
        });

        const lastProgress =
          shippingInformation.progresses[
            shippingInformation.progresses.length - 1
          ];
        if (lastProgress) {
          shippingInformation.state = lastProgress.status;
          if (lastProgress.status.id === 'delivered')
            shippingInformation.to = { time: lastProgress.time };
        }

        resolve(shippingInformation);
      })
      .catch(err => reject(err));
  });
}

module.exports = {
  info: {
    name: 'EMS',
  },
  getTrack,
};
