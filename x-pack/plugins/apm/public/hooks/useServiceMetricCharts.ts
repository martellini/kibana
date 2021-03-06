/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useMemo } from 'react';
import { MetricsChartAPIResponse } from '../../server/lib/metrics/get_all_metrics_chart_data';
import { MemoryChartAPIResponse } from '../../server/lib/metrics/get_memory_chart_data';
import { loadMetricsChartDataForService } from '../services/rest/apm/metrics';
import {
  getCPUSeries,
  getMemorySeries
} from '../store/selectors/chartSelectors';
import { IUrlParams } from '../store/urlParams';
import { useFetcher } from './useFetcher';

const memory: MemoryChartAPIResponse = {
  series: {
    memoryUsedAvg: [],
    memoryUsedMax: []
  },
  overallValues: {
    memoryUsedAvg: null,
    memoryUsedMax: null
  },
  totalHits: 0
};

const INITIAL_DATA: MetricsChartAPIResponse = {
  memory,
  cpu: {
    series: {
      systemCPUAverage: [],
      systemCPUMax: [],
      processCPUAverage: [],
      processCPUMax: []
    },
    overallValues: {
      systemCPUAverage: null,
      systemCPUMax: null,
      processCPUAverage: null,
      processCPUMax: null
    },
    totalHits: 0
  }
};

export function useServiceMetricCharts(urlParams: IUrlParams) {
  const {
    serviceName,
    transactionType,
    start,
    end,
    transactionName,
    kuery
  } = urlParams;

  const { data = INITIAL_DATA, error, status } = useFetcher(
    () =>
      loadMetricsChartDataForService({
        serviceName,
        transactionName,
        transactionType,
        start,
        end,
        kuery
      }),
    [serviceName, transactionName, transactionType, start, end, kuery]
  );

  const memoizedData = useMemo(
    () => ({
      memory: getMemorySeries(urlParams, data.memory),
      cpu: getCPUSeries(data.cpu)
    }),
    [data]
  );

  return {
    data: memoizedData,
    status,
    error
  };
}
