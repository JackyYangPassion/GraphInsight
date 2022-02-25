import ASSETS_PACKAGE from '@alipay/gi-assets/package.json';
import SDK_PACKAGE from '@alipay/graphinsight/package.json';
import { produce } from 'immer';
import beautify from 'js-beautify';
import { getAssetPackages, getCombinedAssets } from '../loader';
export function beautifyCode(code: string) {
  return beautify(code, {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: -1,
    preserve_newlines: false,
    keep_array_indentation: false,
    break_chained_methods: false,
    brace_style: 'collapse',
    space_before_conditional: true,
    unescape_strings: false,
    jslint_happy: false,
    end_with_newline: false,
    wrap_line_length: 120,
    e4x: false,
  });
}
/**
 * get js code for Riddle
 * @param opts  previewer props
 */
const getHtmlAppCode = opts => {
  const { data, id } = opts;
  const config = produce(opts.config, draft => {
    delete draft.node.meta;
    delete draft.node.info;
    delete draft.edge.meta;
    delete draft.edge.info;
  });
  const serviceConfig = produce(opts.serviceConfig, draft => {
    draft.forEach(s => {
      delete s.others;
    });
  });

  try {
  } catch (error) {
    console.log('error', error);
  }

  const configStr = beautifyCode(JSON.stringify(config));
  const dataStr = beautifyCode(JSON.stringify(data));
  const serviceStr = beautifyCode(JSON.stringify(serviceConfig));
  const packages = getAssetPackages();
  const combinedAssets = getCombinedAssets();
  console.log('packages', packages, combinedAssets);
  const GIAssetsScripts = packages
    .map(pkg => {
      return `<script src="${pkg.url}"></script>`;
    })
    .join('\n  ');
  const GIAssetsLinks = packages
    .map(pkg => {
      const href = pkg.url.replace('min.js', 'css');
      return `<link rel="stylesheet" href="${href}" />`;
    })
    .join('\n  ');
  const packagesStr = beautifyCode(JSON.stringify(Object.values(packages)));

  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>

    <!--- CSS -->
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/antd/4.16.13/dist/antd.min.css" />
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/antv/graphin/2.4.0/dist/index.css" />
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/antv/graphin-components/2.4.0/dist/index.css" />
    <link rel="stylesheet" href="https://gw.alipayobjects.com/os/lib/alipay/gi-assets/${ASSETS_PACKAGE.version}/dist/index.css" />
    ${GIAssetsLinks}
 
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel">
/** 计算逻辑 **/
    const packages = ${packagesStr};
    const getAssets = () => {
      return packages
        .map(item => {
          let assets = window[item.global];
          if (!assets) {
            return null;
          }
          if (assets.hasOwnProperty('default')) {
            assets = assets.default;
          }
          return {
            ...item,
            assets,
          };
        })
        .filter(c => {
          return c;
        });
    };

const getCombinedAssets = () => {
  const assets = getAssets();
  return assets.reduce(
    (acc, curr) => {
      return {
        components: {
          ...acc.components,
          ...curr.assets.components,
        },
        elements: {
          ...acc.elements,
          ...curr.assets.elements,
        },
        layouts: {
          ...acc.layouts,
          ...curr.assets.layouts,
        },
      };
    },
    {
      components: {},
      elements: {},
      layouts: {},
    },
  );
};

function looseJsonParse(obj) {
  return Function('"use strict";return (' + obj + ')')();
}
const defaultTransFn = (data, params) => {
  return data;
};

const getServicesByAssets = (assets, data) => {
  return assets.map(s => {
    const { id, content, mode } = s;
    if (mode === 'MOCK') {
      const fn = (params) => {
        return new Promise(async resolve => {
          try {
            const transFn = looseJsonParse(content);
            const transData = transFn(data, params);
            return resolve(transData);
          } catch (error) {
            console.error(error);
            const transData = defaultTransFn(data, params);
            return resolve(transData);
          }
        });
      };

      return {
        id,
        service: fn,
      };
    }
    // if mode==='api'
    const service = params => {
      try {
        return fetch(content, {
          method: 'post',
          // data: params,
        });
      } catch (error) {
        return new Promise(resolve => {
          resolve({});
        });
      }
    };
    return {
      id,
      service,
    };
  });
};



      /**  由GI平台自动生成的，请勿修改 start **/
 
      const GI_SERVICES_OPTIONS = ${serviceStr};
      const GI_PROJECT_CONFIG = ${configStr};
      const GI_LOCAL_DATA = ${dataStr};
      /**  由GI平台自动生成的，请勿修改 end **/
   
      const assets = getCombinedAssets();
    const MyGraphSdk = () => {
      const config = GI_PROJECT_CONFIG;
      const services = getServicesByAssets(GI_SERVICES_OPTIONS,GI_LOCAL_DATA);
    
      return  <div style={{ height: '100vh' }}>
        <GISDK.default config={config} assets={assets} services={services}/>
      </div>;
    };
      window.onload = () => {
        ReactDOM.render(<MyGraphSdk />, document.getElementById('root'));
      };
    </script>
    
    <!--- REACT DEPENDENCIES-->
    <script crossorigin src="https://gw.alipayobjects.com/os/lib/react/17.0.2/umd/react.production.min.js"></script>
    <script
      crossorigin
      src="https://gw.alipayobjects.com/os/lib/react-dom/17.0.2/umd/react-dom.production.min.js"
    ></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!--- GRAPHIN DEPENDENCIES-->
    <script src="https://gw.alipayobjects.com/os/lib/lodash/4.17.21/lodash.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antd/4.16.13/dist/antd.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antv/g6/4.3.7/dist/g6.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antv/graphin/2.4.0/dist/graphin.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antv/graphin-components/2.4.0/dist/graphin-components.min.js"></script>
    <!--- GI DEPENDENCIES-->
    <script src="https://gw.alipayobjects.com/os/lib/alipay/graphinsight/${SDK_PACKAGE.version}/dist/index.min.js"></script>
    ${GIAssetsScripts}
  </body>
</html>
    `;
};

export default getHtmlAppCode;