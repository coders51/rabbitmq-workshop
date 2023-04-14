import { connect } from "amqplib";
import { random } from "lodash";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  const { queue: performancePrepareQueue } = await channel.assertQueue("performancePrepareQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  const { queue: performanceShippedQueue } = await channel.assertQueue("performanceShippedQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  channel.bindQueue(performancePrepareQueue, exchangeName, "prepare_order");
  channel.bindQueue(performanceShippedQueue, exchangeName, "order_shipped");

  const startTimes = new Map<string, number>();
  channel.consume(performancePrepareQueue, async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    startTimes.set(order.orderId, msg.properties.timestamp);
    console.log(`Order ${order.orderId} prepared.`);
  });
  channel.consume(performanceShippedQueue, async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    const startTime = startTimes.get(order.orderId);
    if (startTime) {
      const timeTaken = msg.properties.timestamp - startTime;
      console.log(`Order ${order.orderId} shipped in ${timeTaken} ms.`);
      startTimes.delete(order.orderId);
    } else {
      console.log(`Unknown order ID: ${order.orderId}`);
    }
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
