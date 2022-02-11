//-------------------------------------------------------------------------
//
// Bot
//
//-------------------------------------------------------------------------

let SPEED  = 0.25;
let CAP_SCALING = 0.5;
let CIRCLE_RADIUS = 16.0;

class CBot
{
  constructor()
  {
    this.x = 0;
    this.y = 0;
    this.nx = 0;
    this.ny = 0;
    this.bx1 = 0; 
    this.bx2 = 0;
    this.by1 = 0;
    this.by2 = 0;
    this.obx1 = 0;
    this.obx2 = 0;
    this.oby1 = 0;
    this.oby2 = 0;
    this.col = 0;
    this.sx = 0;
    this.sy = 0;
    this.osx = 0;
    this.osy = 0;
    this.w = 0;
    this.h = 0;
    this.ow = 0;
    this.oh = 0;
    this.scaleX = 0;
    this.scaleY = 0;
    this.on = false;
  }

  setup( iLen )
  {
    let fAngle = random( 360 );
    let fLen = random( iLen );
    this.x = cos( fAngle*PI / 180.0 ) * fLen;
    this.y = sin( fAngle*PI / 180.0 ) * fLen;
    this.bx1 = 0;
    this.bx2 = 0;
    this.by1 = 0;
    this.by2 = 0;
    this.osx = 0;
    this.osy = 0;
  }

  createBoundingBox( bots, map )
  {
    this.obx1 = this.bx1;
    this.oby1 = this.by1;
    this.obx2 = this.bx2;
    this.oby2 = this.by2;
    this.osx = this.sx;
    this.osy = this.sy;
    this.bx1 = 9999999;
    this.bx2 = -9999999;
    this.by1 = 9999999;
    this.by2 = -9999999;

    for ( let i = 0; i < bots.length; i++ )
    {
      let targetBot = bots[i];
      if ( targetBot == this )
      {
        continue;
      }

      if ((targetBot.x - this.x) < this.bx1)
      {
        this.bx1 = (targetBot.x - this.x);
      }
      if ((targetBot.y - this.y) < this.by1)
      {
        this.by1 = (targetBot.y - this.y);
      }
      if ((targetBot.x - this.x) > this.bx2)
      {
        this.bx2 = (targetBot.x - this.x);
      }
      if ((targetBot.y - this.y) > this.by2)
      {
        this.by2 = (targetBot.y - this.y);
      }
    }

    let t = 1;
    this.bx1 = this.bx1 * t + this.obx1 * (1.0 - t);
    this.bx2 = this.bx2 * t + this.obx2 * (1.0 - t);
    this.by1 = this.by1 * t + this.oby1 * (1.0 - t);
    this.by2 = this.by2 * t + this.oby2 * (1.0 - t);
    this.ow = this.w;
    this.oh = this.h;
    this.w = abs(this.bx1) + abs(this.bx2);
    this.h = abs(this.by1) + abs(this.by2);
    this.scaleX = (float(this.w) / float(map.width) )* CAP_SCALING;
    this.scaleY = (float(this.h) / float(map.height))* CAP_SCALING;

    this.sx = (((abs(this.bx1) / this.w - 0.5)*this.scaleX + 0.5)*map.width);
    this.sy = (((abs(this.by1) / this.h - 0.5)*this.scaleY + 0.5)*map.height);
    //sx = sx*t + osx*(1.0 -t);
    //sy = sy*t + osy*(1.0 -t);
    if (this.sx < 0)
    {
      this.sx = 0;
      this.sy = 0;
    }
    if (this.sy < 0)
    {
      this.sx = 0;
      this.sy = 0;
    }
    if (this.sx >= map.width)
    {
      this.sx = 0;
      this.sy = 0;
    }
    if (this.sy >= map.height)
    {
      this.sx = 0;
      this.sy = 0;
    }

    let col = map.pixels[ ( (int(this.sy)*map.width + int(this.sx)) )*4 ];
    if ( col > 127 )
    {
      this.on = false;
    } else
    {
      this.on = true;
    }
  }

  moveNearPoint( bots )
  {
    let minLenOn = 999999;
    let hitBotOn = null;

    for ( let i = 0; i < bots.length; i++)
    {
      let targetBot = bots[i];
      if ( targetBot == this )
      {
        continue;
      }

      if ( targetBot.on )
      {
        let dx = this.x - targetBot.x;
        let dy = this.y - targetBot.y;
        let len = sqrt( dx*dx + dy*dy );
        if (len < minLenOn )
        {
          minLenOn = len;
          hitBotOn = targetBot;
        }
      }
    }

    let minLenOff = 999999;
    let hitBotOff = null;

    for ( let i = 0; i < bots.length; i++ )
    {
      let targetBot = bots[i];
      if ( targetBot == this )
      {
        continue;
      }

      if ( !targetBot.on )
      {
        let dx = this.x - targetBot.x;
        let dy = this.y - targetBot.y;
        let len = sqrt( dx*dx + dy*dy );
        if ( len < minLenOff )
        {
          minLenOff = len;
          hitBotOff = targetBot;
        }
      }
    }

    if ( hitBotOn != null )
    {
      let dx = this.x - hitBotOn.x;
      let dy = this.y - hitBotOn.y;
      let len = sqrt( dx*dx + dy*dy );

      dx /= len;
      dy /= len;
      dx *= SPEED * 1.15;
      dy *= SPEED * 1.15;
      this.nx -= dx;
      this.ny -= dy;
    }

    if (hitBotOff != null)
    {
      let dx = this.x - hitBotOff.x;
      let dy = this.y - hitBotOff.y;
      let len = sqrt(dx*dx + dy*dy );

      dx /= len;
      dy /= len;
      dx *= SPEED;
      dy *= SPEED;
      this.nx += dx;
      this.ny += dy;
    }
  }

  moveFarPoint( bots )
  {
    let minLenOn = 999999;
    let hitBotOn = null;

    for ( let i = 0; i < bots.length; i++ )
    {
      let targetBot = bots[i];
      if ( targetBot == this )
      {
        continue;
      }

      //if ( targetBot.on )
      {
        let dx = this.x - targetBot.x;
        let dy = this.y - targetBot.y;
        let len = sqrt( dx*dx + dy*dy );
        if ( len < minLenOn )
        {
          minLenOn = len;
          hitBotOn = targetBot;
        }
      }
    }

    if ( hitBotOn != null )
    {
      let dx = this.x - hitBotOn.x;
      let dy = this.y - hitBotOn.y;
      let len = sqrt( dx*dx + dy*dy );
      dx /= len;
      dy /= len;
      dx *= SPEED * 1.5;
      dy *= SPEED * 1.5;
      this.nx += dx;
      this.ny += dy;
    }

    /*
    let minLenOff = 999999;
    let hitBotOff = NULL;

    for ( let i = 0; i < bots.length; i++ )
    {
      let targetBot = bots[i];
      if (targetBot == this)
      {
        continue;
      }

      if ( !targetBot.on )
      {
        let dx = this.x - targetBot.x;
        let dy = this.y - targetBot.y;
        let len = sqrt( dx*dx + dy*dy );
        if ( len < minLenOff )
        {
          minLenOff = len;
          hitBotOff = targetBot;
        }
      }
    }
    */
  }

  update( bots, map )
  {
    this.nx = this.x;
    this.ny = this.y;

    this.createBoundingBox( bots, map );

    let col = map.pixels[ ( int(this.sy)*map.width + int(this.sx) ) * 4 ];
    if (col > 127 )
    {
      this.moveNearPoint( bots );
    } else
    {
      this.moveFarPoint( bots );
    }
  }

  draw()
  {
    ellipse( this.x, this.y, CIRCLE_RADIUS, CIRCLE_RADIUS );
  }
}