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
      rk: { type: "string", require: true },
      exchange: { type: "string", default: "orderErrExchange" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = argv.exchange;
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, { autoDelete: false, durable: true });
  console.log(" [*] Waiting for orders in: " + queue + " - To exit press CTRL+C");
  channel.bindQueue(queue, argv.exchange, argv.rk);
  channel.consume(queue, async msg => {
    if(!msg){
        return;
    }
    const order = JSON.parse(msg.content.toString()); 
    try{
        if(order.total >= 1000000000){
            throw new Error();
        }
        await wait(1500);
        console.log(`Order: ${order.orderId} - total: ${order.total}`);
        channel.ack(msg);
    } catch (error) {
      await wait(1500);
      console.log(`Rejected Order: ${order.orderId} due to total > 80`); 
    }
});
  
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);