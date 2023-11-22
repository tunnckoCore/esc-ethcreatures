import { toHex } from "viem";

export async function getGasPrice(apiKey) {
  // &apikey=${apiKey}
  try {
    return fetch(
      `https://api.etherscan.io/api?module=gastracker&action=gasoracle` +
        (apiKey ? `&apikey=${apiKey}` : "")
    )
      .then((r) => r.json())
      .then((r) => Number(r.result.ProposeGasPrice));
  } catch (e) {
    return null;
  }
}

export async function getEthPrice() {
  try {
    return fetch("https://api.etherscan.io/api?module=stats&action=ethprice")
      .then((r) => r.json())
      .then((r) => Number(r.result.ethusd))
      .then((r) => (Number.isNaN(r) ? null : r));
  } catch (e) {
    return null;
  }
}

export let ETH_PRICE = null;
export let GAS_PRICE = null;

export async function estimateCost(data, options) {
  let { gasPrice = 0, ethPrice = 0, safe = true, apiKey } = { ...options };

  GAS_PRICE = gasPrice =
    gasPrice || GAS_PRICE || (await getGasPrice(apiKey)) || 25e9;
  ETH_PRICE = ethPrice = ethPrice || ETH_PRICE || (await getEthPrice()) || 1600;

  const gas = String(gasPrice).length > 5 ? gasPrice : gasPrice * 1e9;
  const trs = 21000;
  const wei = (data.length * (safe ? 20 : 16) + trs) * gas + (safe ? 3e14 : 0);
  // const wei = 338890 * gas + (safe ? 3e14 : 0);
  const eth = wei / 1e18;
  const usd = eth * ethPrice;

  return {
    cost: {
      wei,
      eth,
      usd: usd.toPrecision(3),
    },
    dataLength: data.length,
    ethPrice,
    gasPrice: gas / 1e9,
  };
}

export async function estimateCostFromSvg(svg, options) {
  const data = toHex(
    "data:image/svg+xml;base64," +
      btoa(
        svg ||
          `<svg data-id="199-f3fb444c687aae1-angry" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd" transform="translate(3 6)"><path fill="#7e87bd" d="m81.7 58.117 9.623.418L88.2 60.58c11.601 5.506 7.064 22.803-18.705 16.64l2.655-4.08c18.553 4.946 23.56-3.887 15.079-11.248l-.616 4.103z"/><path fill="#f8f4ff" d="m81.7 58.117 9.623.418L88.2 60.58c7.43 3.527 8.07 12.632 1.093 15.828 3.21-2.688 7.34-9.145-1.544-15.828.506-.727.607-1.137.302-1.229-1.81-.544-3.926-.955-6.35-1.234z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M91.35 57.935c.547.024.764.696.381 1.041l-2.328 1.544c4.947 2.922 6.83 8.34 4.247 12.639-2.583 4.298-9.595 8.01-24.295 4.644-.249-.057.344-.334 1.78-.83 10.937 2.49 18.472-.007 21.231-4.036s.926-9.276-4.423-11.815a.6.6 0 0 1-.149-.984l1.64-1.085-6.622-.288 3.449 5.532.374-2.494c.061-.406.6-.706.987-.364 4.473 3.944 5.48 8.267 2.63 11.117-2.8 2.8-8.786 3.44-16.864 1.516l-1.083-1.511c8.411 2.242 14.515 1.73 17.098-.854 2.027-2.026 1.652-5.18-1.752-8.613l-.445 2.99a.603.603 0 0 1-1.09.251l-4.924-7.9a.6.6 0 0 1 .44-.914z"/><path fill="#7e87bd" d="M73.828 43.419s3.928-11.57 16.62-9.022c-3.416 1.744-.834 5.718-.834 5.718s-6.755-3.25-5.654 2.415c-3.757-3.335-10.132.889-10.132.889z"/><path fill="#f8f4ff" d="M90.448 34.397c-3.416 1.744-.834 5.718-.834 5.718s-3.044-2.211-1.856-4.656c-6.862-.454-11.48 3.95-13.93 7.96.24-1.65 4.667-10.824 16.62-9.022z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M76.207 38.332c-.924 1.065-2.524 3.417-2.947 4.894a.602.602 0 0 0 .9.693c5.791-3.396 8.508-1.734 9.402-.94a.6.6 0 0 0 .987-.564c-.427-2.197.308-2.82 2.1-2.587.502.065 1.71.355 2.705.828.55.261 1.094-.359.763-.868s-.916-1.806-.828-2.884c.068-.839.501-1.497 1.432-1.972a.6.6 0 0 0-.155-1.123c-6.24-1.253-10.982.63-14.359 4.523zm12.76-3.57c-.953.98-1.142 2.713-.537 4.254-3.617-1.105-5.065 0-5.212 2.282-.89-.459-3.336-1.51-8.093.72 3.027-5.762 8.437-7.987 13.843-7.257z"/><path fill="#7e87bd" d="M17.638 43.419s-3.928-11.57-16.62-9.022c3.416 1.744.834 5.718.834 5.718s6.755-3.25 5.654 2.415c3.757-3.335 10.132.889 10.132.889z"/><path fill="#f8f4ff" d="M1.018 34.397c3.416 1.744.834 5.718.834 5.718s3.044-2.211 1.856-4.656c6.862-.454 11.48 3.95 13.93 7.96-.24-1.65-4.667-10.824-16.62-9.022z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M15.259 38.332c.924 1.065 2.524 3.417 2.947 4.894a.602.602 0 0 1-.9.693c-5.791-3.396-8.508-1.734-9.402-.94a.6.6 0 0 1-.987-.564c.427-2.197-.308-2.82-2.1-2.587-.502.065-1.71.355-2.705.828-.55.261-1.094-.359-.763-.868s.916-1.806.828-2.884c-.068-.839-.501-1.497-1.432-1.972A.6.6 0 0 1 .9 33.809c6.24-1.253 10.982.63 14.359 4.523zm-12.76-3.57c.953.98 1.142 2.713.537 4.254 3.617-1.105 5.065 0 5.212 2.282.89-.459 3.336-1.51 8.093.72-3.027-5.762-8.437-7.987-13.843-7.257z"/><path fill="#dcd5e9" d="M45.495 83.767c14.673 0 33 4.516 33-18.902 0-13.472-2.71-22.062-5.453-32.505-4.038-15.374-7.256-26.243-27.547-26.243S21.859 17.182 17.857 32.709c-2.668 10.352-5.362 19.79-5.362 32.156 0 23.418 18.327 18.902 33 18.902z"/><path fill="#f8f4ff" d="M45.495 6.117c20.29 0 23.509 10.869 27.547 26.243 2.743 10.443 5.453 19.033 5.453 32.505 0 7.67-1.966 12.343-5.125 15.16 2.568-2.883 4.125-7.335 4.125-14.16 0-13.472-2.71-22.062-5.453-32.505-4.038-15.374-7.256-26.243-27.547-26.243-8.725 0-14.317 2.046-18.175 5.613l.217-.232c3.876-4.04 9.624-6.381 18.958-6.381z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M45.495 5.517c-9.778 0-16.135 2.52-20.39 7.692-3.199 3.887-4.902 8.23-7.397 17.694s-5.813 21.4-5.813 33.962c0 9.287 3.09 15.163 8.293 17.61 7.639 3.595 15.028 1.89 27.312 1.89 4.995 0 16.152 1.646 23.302-1.89 5.59-2.763 8.293-8.323 8.293-17.61 0-13.624-3.14-23.9-5.763-33.755-2.623-9.857-4.278-14.125-7.507-18.02-4.226-5.098-10.552-7.573-20.33-7.573zm0 1.2c9.445 0 15.429 2.341 19.406 7.14 3.082 3.716 4.696 7.884 7.275 17.576 2.58 9.691 5.719 20.163 5.719 33.432 0 8.866-2.682 14.127-7.632 16.539-6.61 3.22-15.325 1.79-22.768 1.79-12.096 0-20.147 1.467-26.768-1.79-4.77-2.347-7.632-7.673-7.632-16.539 0-12.562 3.315-24.33 5.768-33.636 2.453-9.305 4.114-13.545 7.168-17.257C30.039 9.1 36.053 6.717 45.495 6.717z"/><path fill="#f8f4ff" d="M72.968 53.385c1.61-1.99 2.287-4.879-4.057-9.468 0 0 9.95 5.364 4.057 9.468z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M74.452 47.041c1.619 1.85 1.812 3.858.2 5.731-1.4 1.626-2.82 1.868-4.253.826-1.61-1.17-3.264-4.544-3.985-5.606-.186-.274-.09-.651.19-.827a.609.609 0 0 1 .827.19c.432.637 2.384 4.28 3.685 5.28.858.66 1.621.522 2.626-.645 1.188-1.381 1.06-2.728-.193-4.159-1.077-1.23-2.932-2.412-4.988-3.29a.6.6 0 0 1 .471-1.103c2.208.942 4.205 2.214 5.42 3.603z"/><path fill="#f8f4ff" d="M19.36 53.456c-1.61-1.99-2.287-4.88 4.057-9.468 0 0-9.95 5.364-4.057 9.468z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M17.854 47.326c-1.618 1.85-1.81 3.858-.199 5.731 1.4 1.626 2.82 1.868 4.253.826 1.61-1.17 3.264-4.544 3.985-5.606.186-.274.09-.651-.19-.827a.609.609 0 0 0-.828.19c-.431.637-2.383 4.28-3.684 5.28-.858.66-1.622.521-2.626-.646-1.189-1.38-1.06-2.727.193-4.158 1.077-1.23 2.932-2.412 4.988-3.29a.6.6 0 1 0-.472-1.104c-2.207.943-4.204 2.215-5.42 3.604z"/><path fill="#d2e0f5" d="M61.542 1.117s3.1 5.368-1.22 9.778c-.507.518-2.445.922-3.691 0-1.247-.923-2.059-3.185-.935-4.57 4.332-2.363 5.846-5.208 5.846-5.208z"/><path fill="#f8f4ff" d="M61.542 1.117s3.1 5.368-1.22 9.778a1.245 1.245 0 0 1-.32.223c2.859-3.683 1.157-7.761.662-8.767.616-.743.878-1.234.878-1.234z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M61.012.835c-1.741 2.846-5.016 4.643-5.603 4.963a.6.6 0 0 0-.179.148c-1.274 1.571-.598 4.216 1.044 5.431 1.322.979 3.62.814 4.477-.062a8.892 8.892 0 0 0 1.594-2.195c1.158-2.278 1.3-5.246-.284-8.303-.219-.423-.807-.377-1.049.018zm.426 1.508c1.748 4.876-.976 7.5-1.544 8.132-.278.31-2.04.681-3.04-.169-.998-.85-1.42-2.516-.781-3.482.747-.449 1.304-.8 1.672-1.052 1.371-.942 2.527-1.95 3.693-3.43z"/><path fill="#d2e0f5" d="M29.34 1.118s-3.1 5.368 1.22 9.778c.507.518 2.445.922 3.691 0 1.247-.923 2.059-3.185.935-4.57-4.332-2.363-5.846-5.208-5.846-5.208z"/><path fill="#f8f4ff" d="M29.34 1.118s-3.1 5.368 1.22 9.778c.076.078.185.154.32.223-2.859-3.683-1.157-7.761-.662-8.767-.616-.743-.878-1.234-.878-1.234z"/><path fill="#5e4a7f" fill-rule="nonzero" d="M29.87.836c1.741 2.846 5.016 4.643 5.603 4.963a.6.6 0 0 1 .179.148c1.274 1.571.598 4.216-1.044 5.431-1.322.979-3.62.814-4.477-.062a8.892 8.892 0 0 1-1.594-2.195c-1.158-2.278-1.3-5.246.284-8.303.219-.423.807-.377 1.049.018zm-.426 1.508c-1.748 4.876.976 7.5 1.544 8.132.278.31 2.04.681 3.04-.169.998-.85 1.42-2.516.781-3.482-.747-.449-1.304-.8-1.672-1.052-1.371-.942-2.527-1.95-3.693-3.43z"/><path fill="#5b4d81" fill-rule="nonzero" d="M39.878 18.466a.6.6 0 0 1-.844-.088 8.943 8.943 0 0 0-.598-.573 11.24 11.24 0 0 0-2.08-1.363c-1.73-.895-3.86-1.547-6.425-1.846a.6.6 0 0 1 .138-1.192c2.71.316 4.98 1.01 6.838 1.972 1.591.824 2.584 1.661 3.059 2.246a.6.6 0 0 1-.088.844zM50.622 18.466a.6.6 0 0 0 .844-.088c.247-.254.446-.445.598-.573a11.24 11.24 0 0 1 2.08-1.363c1.73-.895 3.86-1.547 6.425-1.846a.6.6 0 0 0-.138-1.192c-2.71.316-4.98 1.01-6.838 1.972-1.591.824-2.584 1.661-3.059 2.246a.6.6 0 0 0 .088.844z"/><circle cx="33.505" cy="22" r="3" fill="#52437a"/><circle cx="57.505" cy="22" r="3" fill="#52437a"/><g fill-rule="nonzero"><path fill="#5b4d81" d="M38.968 29.729c.262-.524 1.19-1.7 1.687-2.169 1.433-1.348 3.215-2.163 5.35-2.163s3.917.815 5.35 2.163c.497.469 1.423 1.642 1.687 2.169.263.527-.311 1.078-.827.793s-1.188-.511-1.661-.659a15.259 15.259 0 0 0-4.55-.68c-1.58 0-3.044.232-4.362.624-.738.219-1.338.442-1.854.719-.515.276-1.081-.274-.82-.797z"/><path fill="#5e4a7f" d="M29.175 29.426c.382.168.768.4 1.147.673l.276.208c.167.131.3.246.39.329a.25.25 0 0 1-.34.366l-.152-.134a7.873 7.873 0 0 0-.467-.364 5.828 5.828 0 0 0-1.055-.62c-.54-.236-1.002-.296-1.355-.153-.387.156-.745.493-1.065.968a5.99 5.99 0 0 0-.66 1.322l-.067.204a.25.25 0 0 1-.489-.086l.015-.073a6.469 6.469 0 0 1 .786-1.646c.372-.551.8-.953 1.293-1.153.501-.202 1.092-.126 1.743.16zm-6.028-2.605c.633.391 1.088.838 1.296 1.353.171.423.22.91.17 1.444a6.104 6.104 0 0 1-.44 1.713l-.08.184a.25.25 0 0 1-.452-.215l.069-.158a5.627 5.627 0 0 0 .405-1.571c.043-.46.002-.87-.135-1.21-.161-.397-.545-.774-1.096-1.114a7.118 7.118 0 0 0-1.4-.653l-.226-.073c-.142-.041-.218-.18-.18-.312s.177-.21.31-.171l.032.01a7.647 7.647 0 0 1 1.727.773zm6.365-3.98.055.019a.25.25 0 0 1 .12.332l-.084.19-.039.093a8.988 8.988 0 0 0-.51 1.643c-.13.659-.128 1.209.028 1.595.135.332.342.643.61.93.249.27.536.505.835.703l.195.123c.087.051.157.089.204.112a.25.25 0 1 1-.217.45 4.193 4.193 0 0 1-.458-.268 5.092 5.092 0 0 1-.926-.78 3.568 3.568 0 0 1-.706-1.083c-.2-.494-.202-1.133-.055-1.879a9.466 9.466 0 0 1 .538-1.736l.108-.253.024-.052a.25.25 0 0 1 .222-.144zm-1.737-.145-.019.295c-.01.121-.025.263-.044.42a8.407 8.407 0 0 1-.288 1.401c-.265.866-.655 1.468-1.223 1.698-.47.19-1.01.156-1.593-.05a5.424 5.424 0 0 1-1.224-.641 6.01 6.01 0 0 1-.563-.428.25.25 0 0 1 .33-.375l.155.128c.096.075.218.165.36.262.365.249.742.453 1.108.583.479.169.899.195 1.24.057.392-.158.707-.645.932-1.38.124-.403.212-.854.27-1.316l.042-.398c.01-.114.015-.207.018-.275a.25.25 0 0 1 .5.019zM82.172 16.426c.382.168.768.4 1.147.673l.276.208c.167.131.3.246.39.329a.25.25 0 0 1-.34.366l-.152-.134a7.873 7.873 0 0 0-.467-.364 5.828 5.828 0 0 0-1.055-.62c-.54-.236-1.002-.296-1.355-.153-.387.156-.745.493-1.065.968a5.99 5.99 0 0 0-.66 1.322l-.067.204a.25.25 0 0 1-.489-.086l.015-.073a6.469 6.469 0 0 1 .786-1.646c.372-.551.8-.953 1.293-1.153.501-.202 1.092-.126 1.743.16zm-6.028-2.605c.633.391 1.088.838 1.296 1.353.171.423.22.91.17 1.444a6.104 6.104 0 0 1-.44 1.713l-.08.184a.25.25 0 0 1-.452-.215l.069-.158a5.627 5.627 0 0 0 .405-1.571c.043-.46.002-.87-.135-1.21-.161-.397-.545-.774-1.096-1.114a7.118 7.118 0 0 0-1.4-.653l-.226-.073c-.142-.041-.218-.18-.18-.312s.177-.21.31-.171l.032.01a7.647 7.647 0 0 1 1.727.773zm6.365-3.98.055.019a.25.25 0 0 1 .12.332l-.084.19-.039.093a8.988 8.988 0 0 0-.51 1.643c-.13.659-.128 1.209.028 1.595.135.332.342.643.61.93.249.27.536.505.835.703l.195.123c.087.051.157.089.204.112a.25.25 0 1 1-.217.45 4.193 4.193 0 0 1-.458-.268 5.092 5.092 0 0 1-.926-.78 3.568 3.568 0 0 1-.706-1.083c-.2-.494-.202-1.133-.055-1.879a9.466 9.466 0 0 1 .538-1.736l.108-.253.024-.052a.25.25 0 0 1 .222-.144zm-1.737-.145-.019.295c-.01.121-.025.263-.044.42a8.407 8.407 0 0 1-.288 1.401c-.265.866-.655 1.468-1.223 1.698-.47.19-1.01.156-1.593-.05a5.424 5.424 0 0 1-1.224-.641 6.01 6.01 0 0 1-.563-.428.25.25 0 0 1 .33-.375l.155.128c.096.075.218.165.36.262.365.249.742.453 1.108.583.479.169.899.195 1.24.057.392-.158.707-.645.932-1.38.124-.403.212-.854.27-1.316l.042-.398c.01-.114.015-.207.018-.275a.25.25 0 0 1 .5.019z"/></g></g></svg>`
      )
  );

  return estimateCost(data, options);
}

// console.log(
//   await estimateCost(
//     toHex(
//       `data:text/html;base64,PCFkb2N0eXBlIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9IlVURi04Ii8+PG1ldGEgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLGluaXRpYWwtc2NhbGU9MSJuYW1lPSJ2aWV3cG9ydCIvPjx0aXRsZT5SZWN1cnNpdmUgMHhOZWtvPC90aXRsZT48L2hlYWQ+PGJvZHk+PGRpdiBpZD0ibmVrb1Jvb3QiPjwvZGl2PjxzY3JpcHQgdHlwZT0ibW9kdWxlIj5hc3luYyBmdW5jdGlvbiBpbXBvcnRFdGhzY3JpcHRpb24oaWQsIHR5cGUsIGluZm8sIGJhc2VVcmwgPSAiLyIpIHsgbGV0IHJlczsgY29uc3QgZmV0Y2hlciA9ICh1cmwsIF90eXBlKSA9PiBmZXRjaCh1cmwpLnRoZW4oKHgpID0+IHgub2sgPyB4W190eXBlXSgpIDogUHJvbWlzZS5yZWplY3QoImVycmZ0Y2giKSApOyBjb25zdCB1cmwgPSAoYXBpID0gYmFzZVVybCkgPT4gYXBpICsgImV0aHNjcmlwdGlvbnMvIisgaWQgKyAoaW5mbyA/ICIiIDogIi9kYXRhIik7IHRyeSB7IHJlcyA9IHR5cGUgPT0gImpzIiA/IGF3YWl0IGltcG9ydCh1cmwoKSkgOiBhd2FpdCBmZXRjaGVyKHVybCgpLCB0eXBlKTsgfSBjYXRjaCAoZSkgeyB0cnkgeyByZXMgPSB0eXBlID09ICJqcyIgPyBhd2FpdCBpbXBvcnQodXJsKGJhc2VVcmwgKyAiYXBpLyIpKSA6IGF3YWl0IGZldGNoZXIodXJsKGJhc2VVcmwgKyAiYXBpLyIpLCB0eXBlKTsgfSBjYXRjaCAoZXJyb3IpIHsgY29uc29sZS5sb2coImVyciIsIGVycm9yKTsgfSB9IHJldHVybiByZXM7IH0KICBjb25zdCBuZWtvTG9hZCA9IGF3YWl0IGltcG9ydEV0aHNjcmlwdGlvbigiMHhjNzU5MTQ2ZDg1ZTUyNGU0MmU1Njg0ZDNlMTJmNjE3ZTMxZmM4MjZmMDM3YzBkZTNkMDc3M2RmNzI5NWMxZGM1IiwianMiLG51bGwsImh0dHBzOi8vYXBpLmV0aHNjcmlwdGlvbnMuY29tL2FwaS8iKTsKICBhd2FpdCBuZWtvTG9hZC5kZWZhdWx0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIiNuZWtvUm9vdCIpLCB7aW1wb3J0RXRoc2NyaXB0aW9uLG11dGFudE5hbWU6IlJlY3Vyc2l2ZSAweE5la28iLG11dGFudDp0cnVlLHZhcmlhYmxlczogeyJjYXQiOiIjNTM4M2MzIiwiZXllcyI6IiM0ZmRmODQiLCJiZyI6IiMyZjAyMWUiLCJncm91bmQiOiJoc2woMzIyLjY2NjY2NjY2NjY2NjcsIDkxLjg0JSwgNy42OSUpIiwiY3Vyc29yIjoi8J+NjSJ9LHRyYWl0czogeyJjYXQiOiJBc3RybyBOYXV0aWNvIiwiZXllcyI6IldlaXJkIEdyZWVuIiwiYmciOiJWaWVubmEgUm9hc3QiLCJjdXJzb3IiOiJwaW5lYXBwbGUifSxhcGk6Imh0dHBzOi8vYXBpLmV0aHNjcmlwdGlvbnMuY29tL2FwaS8ifSk7Y29uc3QgY29tcHV0ZWRDc3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCIjbmVrb1Jvb3QiKS5xdWVyeVNlbGVjdG9yKCIjbmVrb19jb2xvcnMiKTtjb21wdXRlZENzcy50ZXh0Q29udGVudCA9IGNvbXB1dGVkQ3NzLnRleHRDb250ZW50LnJlcGxhY2UoImJvZHl7YmFja2dyb3VuZC1jb2xvcjp2YXIoLS1iZy1jb2xvcil9IiwiYm9keXt3aWR0aDoxMDB2dztoZWlnaHQ6MTAwdmg7YmFja2dyb3VuZDp2YXIoLS1iZy1jb2xvcik7fSIpPC9zY3JpcHQ+PC9ib2R5PjwvaHRtbD4=`
//     ),
//     { safe: false, gasPrice: 20, ethPrice: 1580 }
//   )
// );

// 6kb cost = at 15 gas, 1620 eth = 9.5 usd
// 6kb cost = at 25 gas, 1620 eth = 15 usd
// 6kb cost = at 40 gas, 1620 eth = 24 usd

// 10kb cost = at 15 gas, 1620 eth = 15 usd
// 10kb cost = at 25 gas, 1620 eth = 25 usd
// 10kb cost = at 40 gas, 1620 eth = 38 usd

// 17kb cost = at 15 gas, 1620 eth = 22 usd
// 17kb cost = at 25 gas, 1620 eth = 37 usd
// 17kb cost = at 40 gas, 1620 eth = 60 usd
// console.log(
//   await estimateCostFromSvg(await Deno.readTextFile("./files/102.svg"), {
//     gasPrice: 40,
//     ethPrice: 1620,
//   })
// );

/*

  // ALL METHODS/OPERATIONS WORK IN BULK too, just pass an array

  data:application/vnd.cardinals.emerge+json,{"content":"<h1>hi wrld</h1>","mimetype":"text/html","id":"0x0_hash_of_og_txn"}
    -> the `from` is set as `creator`,
    -> the `to` is set as the `initialOwner` & `currentOwner`

  data:application/vnd.cardinals.transfer+json {"from":"0xOwner","to":"0xReceiver","id":"0x0_hash_of_og_txn"}
   (send that to 0x0/null address (0x0 is banned in metamask) or to the `from`)
    -> from, to, id
    -> the `from` must match the `currentOwner` of `id`
    -> the "creator" of the transaction must match the `from` and `currentOwner`
    -> the "to" of the transaction must be the 0x00000 address, OR the `from` & `currentOwner`, eg. sent to self
    -> the indexer must check if it is not marked "for sale", if so IGNORE

  data:application/vnd.cardinals.trade.sell+json,{"price":"0.1","from":"0xSeller","id":"0x0_hash_of_og_txn"}
    -> the creator of the "sell" transaction must match the `currentOwner` of the `id`, AND the passed `from`
    -> the indexer must check if it is marked "for sale", if so update the price
    -> OTHERWISE the indexer marks the `id` for sale, with the passed `price` and `from` address

  data:application/vnd.cardinals.trade.buy+json,{"from":"0xBuyer","to":"0xSeller","id":"0x0_hash_of_og_txn"}
    -> the creator of the "buy" transaction must match the passed `from`,
    -> the passed `id` must be already marked for sale thru "sell" transaction
    -> the passed `to` must be `currentOwner` of that `id`
    -> the value for the "buy" txn must be equal to the price of the "sell"

  data:application/vnd.cardinals.trade.cancel+json,{"id":"0x0_hash_of_og_txn"}
    -> the creator of the "cancel" transaction must match the `currentOwner` of the `id`
    -> the indexer must check if it is marked "for sale", if so remove the "for sale" mark, otherwise IGNORE



  Scenario 1: Creator A wants to transfer to User B, by itself
    -> Creator A creates a "transfer" transaction: {from: A, to: B, id: 0x0_hash_of_og_txn}
    -> the indexer/api checks if the `from` matches the `currentOwner` of the `id`, if YES -> VALID transfer, otherwise IGNORE
    -> the indexer updates the state of `id`, making B the `currentOwner` and A the `previousOwner`

  Scenario 2: Creator A wants to sell to a User
    -> Creator A creates an "sell" transaction: {"price":"0.1","from":"0xSeller","id":"0x0_hash_of_og_txn"}
    -> the indexer checks the creator of the transaction is the `currentOwner` of the passed `id`, if YES -> VALID, otherwise IGNORE

    -> Then when someone wants to buy that `id`, they create a "buy" transaction: {"from":"0xBuyer","to":"0xSeller","id":"0x0_hash_of_og_txn"},
       and send the asked price as transaction value
    -> then the indexer checks the creator of the "buy" transaction is not owner of the `id`,
        and the value of the transaction is equal to the price of the "sell"





    -> OR the `from` must be the allowed `nonOwnerAddress` of an "approvedTransfer" transaction which creator must be `currentOwner`,
      thus this allows someone else to "transfer" the users cardinal on user behalf

  data:application/vnd.cardinals.approvedTransfer+json
    -> from - nonOwnerAddress, to, id
    -> the creator of this transaction must match the `currentOwner` of the `id`
    -> this allows the `nonOwnerAddress` to create a valid "transfer" transaction
    -> the indexer must check if it is marked "for sale", if so IGNORE



  DUNE request : curl -X GET "https://api.dune.com/api/v1/query/3028417/results" -H x-dune-api-key:i6UySm7VuICAlrcRL6clEhwxMlcPRFuR
  DUNE response: {
  "execution_id": "01HAJ07YGMBKZ0PJVZ6G13T80D",
  "query_id": 3028417,
  "state": "QUERY_STATE_COMPLETED",
  "submitted_at": "2023-09-17T16:40:38.674743Z",
  "expires_at": "2023-12-16T16:41:17.450169Z",
  "execution_started_at": "2023-09-17T16:40:38.697319Z",
  "execution_ended_at": "2023-09-17T16:41:17.450168Z",
  "result": {
    "rows": [
      {
        "block_time": 9711907,
        "content": "data:application/vnd.cardinals.transfer+json,{\"id\":\"0xf126d7cf1308f00da53d252e875f44467239419b21a9efd5f5c1a4cbd7fefb6e\",\"from\":\"0xA20C07F94A127fD76E61fbeA1019cCe759225002\",\"to\":\"0x3e7a28d96f19b65676F4309531418a03039Ee5b5\"}",
        "creator": "0xa20c07f94a127fd76e61fbea1019cce759225002",
        "data": "0x646174613a6170706c69636174696f6e2f766e642e63617264696e616c732e7472616e736665722b6a736f6e2c7b226964223a22307866313236643763663133303866303064613533643235326538373566343434363732333934313962323161396566643566356331613463626437666566623665222c2266726f6d223a22307841323043303746393441313237664437364536316662654131303139634365373539323235303032222c22746f223a22307833653761323864393666313962363536373646343330393533313431386130333033394565356235227d",
        "owner": "0xa20c07f94a127fd76e61fbea1019cce759225002",
        "tx_hash": "0x17551fdcde684d7f701b79404e032ac24b88205907bf4f00acf670f58d3880ec",
        "tx_index": 34
      },
      {
        "block_time": 9711890,
        "content": "data:application/vnd.cardinals.emerge+json,{\"id\":\"0xf126d7cf1308f00da53d252e875f44467239419b21a9efd5f5c1a4cbd7fefb6e\",\"content\":\"\u003ch1\u003eCardinals Hello World\u003c/h1\u003e\",\"mimetype\":\"text/html\",\"isBase64\":false}",
        "creator": "0xa20c07f94a127fd76e61fbea1019cce759225002",
        "data": "0x646174613a6170706c69636174696f6e2f766e642e63617264696e616c732e656d657267652b6a736f6e2c7b226964223a22307866313236643763663133303866303064613533643235326538373566343434363732333934313962323161396566643566356331613463626437666566623665222c22636f6e74656e74223a223c68313e43617264696e616c732048656c6c6f20576f726c643c2f68313e222c226d696d6574797065223a22746578742f68746d6c222c226973426173653634223a66616c73657d",
        "owner": "0xa20c07f94a127fd76e61fbea1019cce759225002",
        "tx_hash": "0x6dd08602e87f9ab996f6f1f03b3c8b63397f941a670eaa34a6463ccedca808ea",
        "tx_index": 20
      }
    ],
    "metadata": {
      "column_names": [
        "block_time",
        "creator",
        "owner",
        "tx_hash",
        "tx_index",
        "data",
        "content"
      ],
      "result_set_bytes": 1705,
      "total_row_count": 2,
      "datapoint_count": 18,
      "pending_time_millis": 22,
      "execution_time_millis": 38752
    }
  }
}

*/
