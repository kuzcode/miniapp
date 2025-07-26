import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('68518394002460beefca');

const databases = new Databases(client);

export { databases };