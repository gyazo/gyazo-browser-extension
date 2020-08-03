import storage from './storageSwitcher';

export default async () => {
  const { fileSizeLimit } = await storage.get();
  return Number(fileSizeLimit) * 1024 * 1024 * (4 / 3); // Base64 data volume is 4/3 more than original data
};
