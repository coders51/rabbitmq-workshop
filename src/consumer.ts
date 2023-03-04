import { connect } from "amqplib";
import { random } from "lodash";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}

async function main() {
  const conn = await connect("amqp://localhost");
  const ch = await conn.createChannel();
  console.log("queue ", process.argv[2]);
  ch.consume(process.argv[2], (msg) => console.log(msg?.content.toString()));
}

/**
 * Temporary queue
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   const { queue } = await ch.assertQueue("", {
//     autoDelete: true,
//     durable: false,
//   });
//   await ch.bindQueue(queue, "ex-fan", "");
//   await ch.consume(queue, (msg) => console.log(msg?.content.toString()));
// }

/**
 * Ack
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }
//     console.log("msg >>>", msg.content.toString());
//     ch.ack(msg);
//   });
// }

/**
 * Prefetch
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   await ch.prefetch(1);
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, async (msg) => {
//     if (!msg) {
//       return;
//     }
//     console.log("msg >>>", msg.content.toString());
//     // await wait(1000);
//     // ch.ack(msg);
//   });
// }

/**
 * Error
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }
//     // try {
//     if (msg.content.toString() === "error") {
//       console.error("ERRORE!!!!");
//       throw new Error();
//     }
//     console.log("msg >>>", msg.content.toString());
//     // } catch (error) {
//     //   console.error("Errore >>>", error);
//     // }
//     ch.ack(msg);
//   });
// }

// /**
//  * Error
//  */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }
//     try {
//       console.error("ERRORE!!!!");
//       if (msg.content.toString() === "error") {
//         throw new Error();
//       }
//       console.log("msg >>>");
//     } catch (error) {
//       console.log(">>> Err", error);
//     }
//     ch.ack(msg);
//   });
// }

/**
 * Temporary Error with retry
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }
//     try {
//       console.log("--------------------------");
//       console.log("msg ", msg.content.toString());
//       if (msg.content.toString() === "error" && random(1, 10) % 2 === 0) {
//         console.log("RAISE EXCEPTION!!!");
//         throw new Error();
//       }
//       console.log("msg ack!");
//       ch.ack(msg);
//     } catch (error) {
//       console.log(">>> Trapped exception nack");
//       ch.nack(msg);
//     }
//   });
// }

/**
 * Permanent Error with retry
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }
//     try {
//       console.log("--------------------------");
//       console.log("msg ", msg.content.toString());
//       if (msg.content.toString() === "error" && random(1, 10) % 2 === 0) {
//         console.log("RAISE EXCEPTION!!!");
//         throw new Error();
//       }
//       if (msg.content.toString() === "xxx") {
//         console.log("NO WAY!!!");
//         throw new Error();
//       }
//       console.log("msg ack!");
//       ch.ack(msg);
//     } catch (error) {
//       console.log(">>> Trapped exception nack");
//       // ch.nack(msg);
//       ch.nack(msg, false, !msg.fields.redelivered);
//     }
//   });
// }

/**
 * Permanent Error with retry quorum
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }
//     try {
//       console.log("--------------------------");
//       console.log("msg ", msg.content.toString());
//       if (msg.content.toString() === "error" && random(1, 10) % 2 === 0) {
//         console.log("RAISE EXCEPTION!!!");
//         throw new Error();
//       }
//       if (msg.content.toString() === "xxx") {
//         console.log("NO WAY!!!");
//         throw new Error();
//       }
//       console.log("msg ack!");
//       ch.ack(msg);
//     } catch (error) {
//       // OLD behaviour
//       // console.log(">>> Trapped exception nack");
//       // ch.nack(msg, false, !msg.fields.redelivered);

//       // We can get this behaviour also with policy
//       // const deliveryCount = msg.properties.headers["x-delivery-count"] || 0;
//       // console.log(">>> Trapped exception nack", deliveryCount);
//       // ch.nack(msg, false, deliveryCount < 10);

//       console.log(">>> Trapped exception nack");
//       ch.nack(msg, false, true);
//     }
//   });
// }

/**
 * DLQ
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   await ch.prefetch(10);
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(queue, (msg) => {
//     if (!msg) {
//       return;
//     }

//     if (random(1, 10) % 2) {
//       console.log("ACK");
//       ch.ack(msg);
//     } else {
//       console.log("*NACK***");
//       ch.nack(msg, false, false);
//     }
//   });
// }

/**
 * stream
 */
// async function main() {
//   const conn = await connect("amqp://localhost");
//   const ch = await conn.createChannel();
//   await ch.prefetch(1000);
//   console.log("queue ", process.argv[2]);
//   const queue = process.argv[2];
//   await ch.consume(
//     queue,
//     (msg) => {
//       if (!msg) {
//         return;
//       }

//       console.log("ACK", msg.content.toString());
//       ch.ack(msg);
//     },
//     { arguments: { "x-stream-offset": "first" } }
//     // { arguments: { "x-stream-offset": 1015000 } }
//   );
// }

main().then(
  () => console.log("OK!"),
  (err) => console.log("Error: ", err)
);
