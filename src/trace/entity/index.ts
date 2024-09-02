import Model from '../model';

class Entity extends Model {
  uuid!: string;
  time!: number;
  domain!: string;
  href!: string;
  ua!: string;
}

export default Entity;
