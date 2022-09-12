import LineByLine from 'n-readlines';

export async function consumeLines(fileName, lineConsumer) {
  const liner = new LineByLine(fileName);

  let line;
  while(line = liner.next()) {
    line = line.toString('utf8').trim();

    if(line.length > 0) {
      await lineConsumer(line);
    }
  }
}