import { connect } from "amqplib";
import { random} from "lodash";
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
      rk: { type: "string", require: true },
      exchange: { type: "string", default: "orderErrExchange" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createConfirmChannel();
  const exchangeName = argv.exchange;
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, { autoDelete: false, durable: true, arguments:{"x-queue-type": "quorum"}});
  console.log(" [*] Waiting for orders in: " + queue + " - To exit press CTRL+C");
  channel.bindQueue(queue, argv.exchange, argv.rk);
  channel.consume(queue, async msg => {
    if(!msg){
        return;
    }
    const order = JSON.parse(msg.content.toString());  
    try{
      if(order.total >= 80){
        channel.nack(msg)
          return;
      }
      if(random(1, 10) % 2 === 0){
            throw new Error();
      }
        console.log(`Order: ${order.orderId} - total: ${order.total}`);
        channel.ack(msg);
    } catch (error) {
        const deliveryCount = msg.properties.headers["x-delivery-count"] || 0;
        console.error(`Rejected Order: ${order.orderId} - redelivered: ${deliveryCount} - requeuing: ${deliveryCount < 10}`); 
        channel.nack(msg, false, deliveryCount < 10);
    }
});
  
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);