import { Frame } from '../types';
//@ts-ignore
import { TimeSeries, Index } from 'pondjs';

export const processData = (series: Frame[]) => {
  let maxTotal = 0;
  let isEqual = true;
  const columns: string[] = [];

  const len_0 = series[0].length;

  series.map(serie => {
    if (serie.length != len_0) {
      isEqual = false;
      return;
    }
  });

  if (!isEqual)
    return {
      data: null,
      max: 0,
    };

  series.map(serie => {
    const tmpMax = Math.max(...serie.fields[0].values.buffer);
    const name = serie.name || '';
    columns.push(name);
    if (tmpMax > maxTotal) maxTotal = tmpMax;
  });

  if (maxTotal == 0)
    return {
      data: null,
      max: 0,
    };

  const [a, b] = series[0].fields[1].values.buffer;
  const interval = (b - a) / 60000;
  const points = series[0].fields[0].values.buffer.map((v, i) => {
    const result = [Index.getIndexString(`${interval}m`, series[0].fields[1].values.buffer[i]), v];
    for (let irow = 1; irow < series.length; irow++) {
      result.push(series[irow].fields[0].values.buffer[i]);
    }
    return result;
  });

  return {
    data: new TimeSeries({
      name: 'Visitors',
      columns: ['index', ...columns],
      points,
    }),
    max: maxTotal + 10,
    columns,
  };
};
