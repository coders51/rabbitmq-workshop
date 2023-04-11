import { connect } from "amqplib";
import { random } from "lodash";
import yargs from "yargs";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}
async function main() {
  const argv = yargs(process.argv.slice(2))
    .options({
      queue: { type: "string", default: "q1" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  channel.bindQueue(queue, exchangeName, "prepare_order");
  channel.bindQueue(queue, exchangeName, "amended_shipment");
  channel.consume(queue, async msg => {
    if (!msg) {
      return;
    }
    const order = JSON.parse(msg.content.toString());
    if (order.level === "normal") {
      await wait(random(1000, 5000));
    }
    if (order.type == "amended_shipment") {
      console.log("shipment_amended", order.orderId, order.level);
      const message = { type: "shipment_amended", orderId: order.orderId };
      const jsonMessage = JSON.stringify(message);
      const rk = "shipment_amended";
      channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
    } else {
      console.log(order.orderId, order.level);
      const message = { type: "order_shipped", orderId: order.orderId, level: order.level };
      const jsonMessage = JSON.stringify(message);
      const rk = "order_shipped";
      channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
    }
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
