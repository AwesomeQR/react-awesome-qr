export const QRTEXT = "Awesome-qr.js";

export const fsImageAsDataURI = async (path: string) => {
  const blob = await fetch(path).then((res) => res.blob());
  const reader = new FileReader();
  return await new Promise<string>((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    return reader.readAsDataURL(blob);
  });
};
