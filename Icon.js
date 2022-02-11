class Icon
{
  constructor()
  {
    this.x = 0;
    this.y = 0;
    this.svgOn = null;
    this.svgOff = null;
    this.scale = 1;
    this.on = false;
    this.current = false;
  }

  draw()
  {
    push();
    translate( this.x, this.y );
    scale( this.scale, this.scale );
    if ( this.on || this.current )
    {
      image( this.svgOn, 0, 0 );
    }
    else
    {
      image( this.svgOff, 0, 0 );
    }
    pop();
  }


  isHit( _x, _y )
  {
    let sx = float(height) / float(BASE_SCREEN_HEIGHT);
    let sy = float(height) / float(BASE_SCREEN_HEIGHT);
    let xx = _x / sx;
    let yy = _y / sy;
    if ( xx > this.x && yy > this.y && xx < (this.x+this.svgOn.width*this.scale) && yy < (this.y+this.svgOn.height*this.scale))
    {
      return true;
    }
    return false;
  }
}