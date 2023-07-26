import * as Bob from '@bob-plug/core';
import { getSupportLanguages, standardToNoStandard } from './lang';
import { _translate as translateByWeb } from './google-translate';
import { _translate as translateByRPC } from './google-translate-rpc';
import { _translate as translateByMobile } from './google-translate-mobile';

var formatString = require('./libs/human-string');

function supportLanguages(): Bob.supportLanguages {
  return getSupportLanguages();
}

// https://ripperhe.gitee.io/bob/#/plugin/quickstart/translate
function translate(query: Bob.TranslateQuery, completion: Bob.Completion) {
  const { text = '', detectFrom, detectTo } = query;

  // https://github.com/char8x/bobplugin-google-translate/issues/21
  // 是否开启字符串分隔处理, 默认关闭(现在 Google Translate API 已经能很好的拆分)
  const stringFmt = Bob.api.getOption('stringFmt') === 'enable';
  const str = stringFmt ? formatString(text) : text;

  const from = standardToNoStandard(detectFrom);
  const to = standardToNoStandard(detectTo);
  const params = { from, to, cache: Bob.api.getOption('cache') };

  const translateVersion = Bob.api.getOption('version');
  let res;
  if (translateVersion === 'rpc') {
    res = translateByRPC(str, params);
  } else {
    res = translateByWeb(str, params);
  }

  res
    .then((result) => completion({ result }))
    .catch((error) => {
      Bob.api.$log.error(JSON.stringify(error));
      if (error?.type) return completion({ error });
      completion({ error: Bob.util.error('api', '插件出错', error) });
    });
}

global.supportLanguages = supportLanguages;
global.translate = translate;
