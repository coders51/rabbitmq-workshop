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
      queue: {type: "string", default: "q1"},
      rk: { type: "string", default: "" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "orderErrEx";
  await channel.assertExchange(exchangeName, "fanout");
  const { queue } = await channel.assertQueue(argv.queue, { autoDelete: false, durable: true });
  console.log(" [*] Waiting for orders in: " + queue + " - To exit press CTRL+C");
  channel.bindQueue(queue, exchangeName, argv.rk);
  await channel.consume(queue, (msg) => {
    if(!msg){
        return;
    }
    const order = JSON.parse(msg.content.toString()); 
    try{
        if(order.total >= 80){
            console.log(`Rejected Order: ${order.orderId} due to total > 80 **requeued**`); 
            channel.nack(msg);
            throw new Error();
        }
        console.log(`Order: ${order.orderId} - total: ${order.total}`);
    } catch (error) {
        console.log(">>> Error", error);
    } 
    wait(1500);
    channel.ack(msg);
});
  
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);