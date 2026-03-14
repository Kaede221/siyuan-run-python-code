import { Client } from "@siyuan-community/siyuan-sdk";
import { CONFIG_FILE_PATH } from "@/constants/PATHS";

/* 初始化客户端 (默认使用 Axios 发起 XHR 请求) */
export const siyuanClient = new Client({
  /**
   * (可选) 思源内核服务 token
   * @default: <空>
   */
  // token: "9gemfdihyg6yputo", // , 默认为空
  /**
   * (可选) Axios 其他请求配置
   * REF: https://axios-http.com/zh/docs/req_config
   * REF: https://www.axios-http.cn/docs/req_config
   */
});

export const currentWidgetID = window?.frameElement?.parentElement?.parentElement?.dataset.nodeId;

export async function SaveWidgetData(data: any) {
  const rsp = await siyuanClient.setBlockAttrs({
    id: currentWidgetID!,
    attrs: {
      "custom-run-python-code-data": JSON.stringify(data),
    },
  });

  if (rsp.code !== 0) {
    throw new Error(rsp.msg);
  }
}

export async function GetWidgetData() {
  const rsp = await siyuanClient.getBlockAttrs({
    id: currentWidgetID!,
  });

  // console.log('GetWidgetData', rsp)

  if (rsp.code !== 0) {
    return {};
  }

  return JSON.parse(rsp.data?.["custom-run-python-code-data"] || "{}");
}

export async function SaveConfig(config: any) {
  const rsp = await siyuanClient.putFile({
    path: CONFIG_FILE_PATH,
    file: JSON.stringify(config),
  });
  if (rsp.code !== 0) {
    throw new Error(rsp.msg);
  }
}

export async function GetConfig(): Promise<{ theme: string } | null> {
  try {
    const rsp = await siyuanClient.getFile(
      {
        path: CONFIG_FILE_PATH,
      },
      "json",
    );
    return rsp as { theme: string };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function ClearWidgetData() {
  const rsp = await siyuanClient.setBlockAttrs({
    id: currentWidgetID!,
    attrs: {
      "custom-run-python-code-data": JSON.stringify({}),
    },
  });

  if (rsp.code !== 0) {
    throw new Error(rsp.msg);
  }
}

export async function ClearConfig() {
  const defaultConfig = {
    theme: "vs-light",
  };
  const rsp = await siyuanClient.putFile({
    path: CONFIG_FILE_PATH,
    file: JSON.stringify(defaultConfig),
  });
  if (rsp.code !== 0) {
    throw new Error(rsp.msg);
  }
}
