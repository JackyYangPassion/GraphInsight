import request from 'umi-request';
import { notification } from 'antd';

export const LanguageQueryService = {
  name: 'Neo4j Cypher 查询',
  service: async (params = {}) => {
    const { value } = params as any;

    const httpServerURL = localStorage.getItem('Neo4j_HTTP_SERVER');

    const response = await request(`${httpServerURL}/api/neo4j/languagequery`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data: {
        value,
      },
    });
    const { data, success, message } = response;
    if (!success) {
      notification.error({
        message: '执行 Cypher 查询失败',
        description: `查询失败：${message}`,
      });
      return {
        nodes: [],
        edges: [],
      };
    }

    const res = {
      nodes: data.nodes.map(item => {
        const { properties, ...others } = item;
        return {
          ...others,
          data: properties,
        };
      }),
      edges: data.edges.map(item => {
        if (!item) {
          return undefined;
        }
        const { properties, ...others } = item;
        return {
          ...others,
          data: properties,
        };
      }),
    };
    return res;
  },
};