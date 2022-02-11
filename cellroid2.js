//-------------------------------------------------------------------------
//
// cellroid2 for Processing
//
// You can download Processing at the following URL.
//                           https://processing.org/
//                                                            by Jun Fujiki
//
//-------------------------------------------------------------------------

let BASE_SCREEN_WIDTH = 1920;
let BASE_SCREEN_HEIGHT = 1080;
let BASE_SCALE = 0.5;

let BOT_NUM = 256;
let ACTION_NUM = 32;
let ICON_NUM = 3;

let canvas;
let bots = [];
let icon = [];
let map;
let pCenterX = 0;
let pCenterY = 0;
let points = [];
let pmouseOn = false;

class Point
{
  constructor()
  {
    this.x = 0;
    this.y = 0;
  }
}

function preload()
{
  map = loadImage( "data/test.png" );

  icon[0] = new Icon();
  icon[1] = new Icon();
  icon[2] = new Icon();
  icon[0].svgOff = loadImage("data/pen.svg");
  icon[1].svgOff = loadImage("data/add.svg");
  icon[2].svgOff = loadImage("data/del.svg");
  icon[0].svgOn = loadImage("data/pen_on.svg");
  icon[1].svgOn = loadImage("data/add_on.svg");
  icon[2].svgOn = loadImage("data/del_on.svg");
}

function setup()
{
  canvas = createCanvas( windowWidth, windowHeight );  
  canvas.style('z-index', '-1');
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');

  map.loadPixels();

  smooth();
  noStroke();
  ellipseMode( CENTER );

  for ( let i=0; i<96; i++ )
  {
    let bot = new CBot();
    bot.setup( height/2 );
    bots.push( bot );
  }

  icon[0].current = true;
}

function draw() 
{
  background( 255 );

  // setup
  let sy = float(height) / float(BASE_SCREEN_HEIGHT);
  for ( let i = 0; i < ICON_NUM; i++ )
  {
    icon[i].scale = 0.25 * sy;
    icon[i].x = 16;
    icon[i].y = i*(icon[i].svgOn.height * icon[i].scale + icon[i].x) + icon[i].x;
  }

  // action
  for ( let m = 0; m<ACTION_NUM; m++ )
  {
    for ( let i = 0; i<bots.length; i++ )
    {
      bots[i].update( bots, map );
    }

    for ( let i = 0; i<bots.length; i++ )
    {
      bots[i].x = bots[i].nx;
      bots[i].y = bots[i].ny;
    }
  }

  // icon
  /*
  if ( mouseIsPressed  )
   {
   for ( let i = 0; i < ICON_NUM; i++)
   {
   if (icon[i].isHit( mouseX, mouseY ) )
   {
   icon[i].on = true;
   } else
   {
   icon[i].on = false;
   }
   }
   }*/

  // render
  push();

  let r1 = float(width)/float(BASE_SCREEN_WIDTH);
  let r2 = float(height)/float(BASE_SCREEN_HEIGHT);
  let h, w;
  if ( r1 < r2 )
  {    
    w =  r1;
    h =  r1;
  } else
  {
    w =  r2;
    h =  r2;
  }

  translate( width / 2, height / 2 );
  scale( w*BASE_SCALE, h*BASE_SCALE );

  noStroke();
  fill( 0 );
  for ( let i = 0; i<bots.length; i++ )
  {
    bots[i].draw();
  }

  // centering
  let min_x = 9999;
  let min_y = 9999;
  let max_x = -9999;
  let max_y = -9999;
  for ( let i = 0; i<bots.length; i++ )
  {
    let bot = bots[i];
    if (bot.x < min_x)
    {
      min_x = bot.x;
    }
    if (bot.y < min_y)
    {
      min_y = bot.y;
    }

    if (bot.x > max_x)
    {
      max_x = bot.x;
    }
    if (bot.y > max_y)
    {
      max_y = bot.y;
    }
  }

  let CENTER_X = (min_x + max_x) * 0.5;
  let CENTER_Y = (min_y + max_y) * 0.5;
  let t = 0.5;// 0.9995;
  CENTER_X = CENTER_X*(1.0 - t) + pCenterX*t;
  CENTER_Y = CENTER_Y*(1.0 - t) + pCenterY*t;
  for ( let i = 0; i<bots.length; i++ )
  {
    let bot = bots[i];
    bot.x -= CENTER_X;
    bot.y -= CENTER_Y;
  }
  pCenterX = CENTER_X;
  pCenterY = CENTER_Y;

  pop();

  // icon
  push();
  scale(
    float(height) / float(BASE_SCREEN_HEIGHT), 
    float(height) / float(BASE_SCREEN_HEIGHT)
    );
  for ( let i = 0; i < ICON_NUM; i++ )
  {
    icon[i].draw();
  }
  pop();

  // draw
  noFill();
  stroke( 200 );
  strokeWeight( 4 );
  beginShape();
  for ( let i = 0; i < points.length; i++ )
  {
    vertex( points[i].x, points[i].y );
  }
  endShape();

  //image( map, 0, 0 );
  if( mouseIsPressed && !pmouseOn )
  {
    jmousePressed();
  }
  else if( !mouseIsPressed && pmouseOn )
  {
    jmouseReleased();
  }
  else if( mouseIsPressed && pmouseOn )
  {
    jmouseDragged();
  }
  
  pmouseOn = mouseIsPressed;
}

function windowResized() 
{ 
  resizeCanvas( windowWidth, windowHeight );
}

function jmouseDragged()
{
  // action
  if ( icon[0].current )
  {
    let p = new Point();
    p.x = mouseX;
    p.y = mouseY;
    points.push( p );
  }
}

function jmousePressed()
{
  // icon
  for ( let i = 0; i < ICON_NUM; i++ )
  {
    if ( icon[i].isHit( mouseX, mouseY ) )
    {
      for ( let j = 0; j < ICON_NUM; j++ )
      {
        icon[j].current = false;
      }
      icon[i].current = true;
      points.length = 0;

      return;
    }
  }

  let r1 = float(width)/float(BASE_SCREEN_WIDTH);
  let r2 = float(height)/float(BASE_SCREEN_HEIGHT);
  let h, w;
  if ( r1 < r2 )
  {    
    w =  r1;
    h =  r1;
  } else
  {
    w =  r2;
    h =  r2;
  }

  // action
  if ( icon[0].current )
  {
  } else if ( icon[1].current )
  {
    let sx = BASE_SCALE * w;
    let sy = BASE_SCALE * h;

    let b = new CBot( height );
    b.x = ( mouseX - width / 2) / sx;
    b.y = ( mouseY - height / 2) / sy;
    bots.push( b );
  } else if ( icon[2].current )
  {
    let sx = BASE_SCALE * w;
    let sy = BASE_SCALE * h;

    let bx = ( mouseX - width / 2) / sx;
    let by = ( mouseY - height / 2) / sy;
    for ( let i = 0; i<bots.length; i++ )
    {
      let bot = bots[i];
      let xx = bot.x - bx;
      let yy = bot.y - by;
      let d = sqrt( xx*xx + yy*yy );
      if (d < 64)
      {
        bots.splice( i, 1 );
        i--;
      }
    }
  }
}

function jmouseReleased()
{
  // action
  if ( icon[0].current && points.length>0 )
  {
    let bx1 = 9999999;
    let bx2 = -9999999;
    let by1 = 9999999;
    let by2 = -9999999;
    for ( let i = 0; i < points.length; i++ )
    { 
      if ( points[i].x < bx1)
      {
        bx1 = points[i].x;
      }
      if ( points[i].y < by1)
      {
        by1 = points[i].y;
      }
      if ( points[i].x > bx2)
      {
        bx2 = points[i].x;
      }
      if ( points[i].y > by2)
      {
        by2 = points[i].y;
      }
    }

    if (bx2 - bx1 > 8 && by2 - by1 > 8)
    {
      map = createGraphics( bx2 - bx1, by2 - by1 );
      map.background( 255 );
      map.beginShape();
      map.noStroke();
      map.fill( 0 );
      for ( let i = 0; i < points.length; i++ )
      {
        map.vertex( points[i].x-bx1, points[i].y-by1 );
      }
      map.endShape();
      map.loadPixels();
    }

    points.length = 0;
  }
}