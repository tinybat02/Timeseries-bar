//@ts-nocheck
import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Frame } from 'types';
import { processData } from './util/process';
import { TimeSeries, Index } from 'pondjs';
import { Resizable, Charts, ChartContainer, ChartRow, YAxis, BarChart, styler, Legend } from 'react-timeseries-charts';
import { colors } from './constants';

interface Props extends PanelProps<PanelOptions> {}
interface State {
  data: TimeSeries | null;
  max: number;
}

export class MainPanel extends PureComponent<Props, State> {
  state = {
    highlight: null,
    data: null,
    timerange: null,
    max: 0,
    columns: [],
  };

  componentDidMount() {
    const series = this.props.data.series as Frame[];
    if (series.length == 0) return;

    const { data, max, columns } = processData(series);
    if (!data) return;

    this.setState({ timerange: data.range(), data, max, highlight: null, columns });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.data.series != this.props.data.series) {
      const series = this.props.data.series as Frame[];
      if (series.length == 0) {
        this.setState({ highlight: null, data: null, timerange: null, max: 0, columns: [] });
        return;
      }

      const { data, max, columns } = processData(series);

      if (!data) {
        this.setState({ highlight: null, data: null, timerange: null, max: 0, columns: [] });
        return;
      }
      this.setState({ timerange: data.range(), data, max, highlight: null, columns });
    }
  }

  handleTimeRangeChange = timerange => {
    this.setState({ timerange });
  };

  render() {
    const { width, height } = this.props;
    const { timerange, data, max, highlight, columns } = this.state;

    if (!data) return <div>No Data</div>;

    const stylD = [],
      legendD = [];
    columns.map((col, i) => {
      stylD.push({
        key: col,
        color: colors[i],
      });
      legendD.push({ key: col, label: col });
    });

    const style = styler(stylD);

    let infoValues = [];

    if (highlight) {
      const trafficText = `${highlight.event.get(highlight.column)}`;
      infoValues = [{ label: 'Visitors', value: trafficText }];
    }

    let barCharts;
    if (columns.length == 1)
      barCharts = (
        <BarChart
          axis="Visitors"
          style={style}
          spacing={1}
          columns={columns}
          series={data}
          infoWidth={100}
          infoStyle={{
            label: {
              fontSize: 14,
              fill: '#000',
              opacity: 1,
            },
            box: {
              fill: '#fff',
              stroke: '#000',
              opacity: 1,
            },
          }}
          info={infoValues}
          infoTimeFormat={index => (
            <tspan style={{ fill: '#000', opacity: 1 }}>
              {index
                .begin()
                .toUTCString()
                .replace(' GMT', '')
                .replace(' 00:00:00', '')}
            </tspan>
          )}
          highlighted={this.state.highlight}
          onHighlightChange={highlight => this.setState({ highlight })}
        />
      );

    if (columns.length > 1)
      barCharts = columns.map((col, i) => (
        <BarChart
          axis="Visitors"
          style={style}
          spacing={1}
          size={10}
          offset={5.5 * Math.pow(-1, i + 1)}
          columns={[col]}
          series={data}
          infoWidth={120}
          infoStyle={{
            label: {
              fontSize: 14,
              fill: '#000',
              opacity: 1,
            },
            box: {
              fill: '#fff',
              stroke: '#000',
              opacity: 1,
            },
          }}
          info={infoValues}
          infoTimeFormat={index => <tspan style={{ fill: '#000', opacity: 1 }}>{index.begin().toUTCString()}</tspan>}
          highlighted={this.state.highlight}
          onHighlightChange={highlight => this.setState({ highlight })}
        />
      ));

    return (
      <div
        style={{
          width,
          height,
          padding: 10,
        }}
      >
        {columns.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Legend categories={legendD} style={style} type="dot" />
          </div>
        )}

        <Resizable>
          <ChartContainer timeRange={timerange} enablePanZoom={true} onTimeRangeChanged={this.handleTimeRangeChange}>
            <ChartRow height={columns.length > 1 ? height - 100 : height - 50}>
              <YAxis
                id="Visitors"
                label="Visitors"
                min={0}
                max={max}
                // format=".2f"
                // width="70"
                type="linear"
              />
              <Charts>{barCharts}</Charts>
            </ChartRow>
          </ChartContainer>
        </Resizable>
      </div>
    );
  }
}

{
  /* <BarChart
  axis="Visitors"
  style={style}
  spacing={1}
  size={10}
  offset={-5.5}
  columns={['device']}
  series={data}
  info={infoValues}
  infoTimeFormat={index => index.begin().toLocaleString()}
  highlighted={this.state.highlight}
  onHighlightChange={highlight => this.setState({ highlight })}
/>
<BarChart
  axis="Visitors"
  style={style}
  spacing={1}
  size={10}
  offset={5.5}
  columns={['manual']}
  series={data}
  info={infoValues}
  infoTimeFormat={index => index.begin().toLocaleString()}
  highlighted={this.state.highlight}
  onHighlightChange={highlight => this.setState({ highlight })}
/> */
}
