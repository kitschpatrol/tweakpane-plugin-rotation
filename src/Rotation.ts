import { Euler } from './Euler';
import { EulerOrder } from './EulerOrder';
import { EulerUnit } from './EulerUnit';
import { Quaternion } from './Quaternion';

export abstract class Rotation {
  public abstract get quat(): Quaternion;

  public abstract toEuler( order: EulerOrder, unit: EulerUnit ): Euler;

  /**
   * Convert the input rotation to the format compatible with this rotation.
   */
  public abstract format( r: Rotation ): Rotation;

  public multiply( b: Rotation ): Rotation {
    return this.format( this.quat.multiply( b.quat ) );
  }

  public premultiply( a: Rotation ): Rotation {
    return this.format( a.multiply( this ) );
  }

  public slerp( b: Rotation, t: number ): Rotation {
    return this.format( this.quat.slerp( b.quat, t ) );
  }
}
