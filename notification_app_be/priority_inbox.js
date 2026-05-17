const http = require('http');

/**
 * Priority Weights:
 * Placement: 3
 * Result: 2
 * Event: 1
 */
const TYPE_WEIGHTS = {
      'Placement': 3,
      'Result': 2,
      'Event': 1
};

const API_URL = 'http://4.224.186.213/evaluation-service/notifications';

function fetchNotifications() {
      return new Promise((resolve, reject) => {
                http.get(API_URL, (res) => {
                              let data = '';
                              res.on('data', (chunk) => data += chunk);
                              res.on('end', () => {
                                                try {
                                                                      const json = JSON.parse(data);
                                                                      resolve(json.notifications || json);
                                                } catch (e) {
                                                                      reject(e);
                                                }
                              });
                }).on('error', reject);
      });
}

async function getPriorityInbox() {
      try {
                console.log("Fetching notifications from API...");
                const notifications = await fetchNotifications();

          console.log(`Successfully fetched ${notifications.length} notifications.`);

          const sorted = notifications.sort((a, b) => {
                        const weightA = TYPE_WEIGHTS[a.Type] || 0;
                        const weightB = TYPE_WEIGHTS[b.Type] || 0;

                                                        if (weightA !== weightB) {
                                                                          return weightB - weightA;
                                                        }

                                                        return new Date(b.Timestamp) - new Date(a.Timestamp);
          });

          const top10 = sorted.slice(0, 10);

          console.log("\n--- TOP 10 PRIORITY NOTIFICATIONS ---");
                top10.forEach((n, index) => {
                              console.log(`${index + 1}. [${n.Type}] - ${n.Message}`);
                              console.log(`   ID: ${n.ID}`);
                              console.log(`   Timestamp: ${n.Timestamp}`);
                              console.log('-----------------------------------');
                });

      } catch (error) {
                console.error("Error fetching or processing notifications:", error.message);
      }
}

getPriorityInbox();
