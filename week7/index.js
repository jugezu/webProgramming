let game


const gameOptions = {
    dudeGravity: 800,
    dudeSpeed: 300
}
window.onload= function (){
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#ffffffff",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: PlayGame

    }
    game= new Phaser.Game(gameConfig)
    window.focus();
}

class PlayGame extends Phaser.Scene{

    constructor(){
        super("PlayGame")
        this.score=0;
        }
    
    preload(){
        this.load.image("ground","assets/platform.png")
        this.load.spritesheet("dude","assets/dude.png",{frameWidth: 32, frameHeight: 48})
        this.load.image("star","assets/star.png")
        this.load.image("magnifying","assets/new_moon.png")
        this.load.image("clock","assets/clock2.png")
    }


 
    

    create(){


    // background help: https://phaser.io/examples/v3.85.0/textures/canvas-textures/view/create-canvas 
        //and: https://phaser.io/examples/v3.85.0/fx/gradient/view/gradient-fx 

        const bg = this.add.image(400, 500, '__WHITE');

        bg.setDisplaySize(1000, 1000);

        const gradient = bg.preFX.addGradient();
        
        gradient.size = bg.displayHeight;
        gradient.color1 = 0x00000ff;
        gradient.color2 = 0xff00000;

        


        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })   


        //ground being created
        for(let i=0; i<20; i++){
            
            this.groundGroup.create(Phaser.Math.Between(0, game.config.width),
            Phaser.Math.Between(0, game.config.height),"ground");

        }

        this.dude = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, "dude")
        this.dude.body.gravity.y=gameOptions.dudeGravity //gravity
        

        //stars
        this.starsGroup=this.physics.add.group({})
        this.physics.add.collider(this.starsGroup,this.groundGroup)

        this.physics.add.overlap(this.dude, this.starsGroup,this.collectStar, null, this)
        
        this.add.image(16,16,"star")
        this.scoreText= this.add.text(32,3,"0",{fontSize: "30px", fill: "#ffffffff"})


        // Moon = lower gravity

        //magnifying glass Moon icon.
        // I tried making scaling the character but it clipped trough the ground
        // and changed it to the moon icon.
        this.magnifyingGroup=this.physics.add.group({})
        this.physics.add.collider(this.magnifyingGroup,this.groundGroup)
        this.physics.add.overlap(this.dude, this.magnifyingGroup,this.collectMagnifying, null, this)

        
        // clock = game runs faster (not the dude)
        this.clockGroup=this.physics.add.group({})
        this.physics.add.collider(this.clockGroup,this.groundGroup)
        this.physics.add.overlap(this.dude, this.clockGroup,this.collectClock, null, this)
        this.dudeSpeed =gameOptions.dudeSpeed

        //collider
        this.physics.add.collider(this.dude,this.groundGroup)

        //input things
        this.cursors=this.input.keyboard.createCursorKeys()

        // time: https://docs.phaser.io/phaser/concepts/time 
        this.timer=0

        this.magnifyingTimer=null
        this.clockTimer=null

        this.showTimer= this.add.text(400,10,"0",{
            fontSize: "35px"
            
        })

        this.anims.create({
            key: "turn",
            frames: [{key: "dude", frame:4}],
                framerate: 10,

        })

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude",
                {
                start:0, end:3}),
                framerate: 10,
                repeat: -1
        })


        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude",
                {
                start:5, end:10}),
                framerate: 10,
                repeat: -1
        })

        this.triggerTimer= this.time.addEvent({
            callback: this.addGround,
            callbackScope: this,
            delay: 700,
            loop: true
        })
    }

    addGround(){
        console.log("adding new stuff...")
        
        this.groundGroup.create(Phaser.Math.Between(0, game.config.width),0,"ground")
        this.groundGroup.setVelocityY(gameOptions.dudeSpeed/6)

        if(Phaser.Math.Between(0,1)){
            this.starsGroup.create(Phaser.Math.Between(0, game.config.width),0,"star")
            this.starsGroup.setVelocityY(gameOptions.dudeSpeed)

            if(Phaser.Math.Between(0,3)){
                let magnifying = this.magnifyingGroup.create(Phaser.Math.Between(0, game.config.width), 0, "magnifying");
                magnifying.setScale(0.2);

                this.magnifyingGroup.setVelocityY(gameOptions.dudeSpeed)

                let clock = this.clockGroup.create(Phaser.Math.Between(0, game.config.width), 0, "clock");
                clock.setScale(0.2);

                this.clockGroup.setVelocityY(gameOptions.dudeSpeed)

            }

            
        }   
    }



    //collectibles
    collectStar(dude,star){
        star.disableBody(true,true)
        this.score +=1
        this.scoreText.setText(this.score)
    }
    
    collectMagnifying(dude,magnifying){
        magnifying.disableBody(true,true)

        this.dude.body.setGravityY(400)
        if(this.magnifyingTimer){
            this.magnifyingTimer.remove(false)
        }
        //5s delay
        this.magnifyingTimer=this.time.delayedCall(5000,()=>{
            this.dude.body.setGravityY(800)
            this.magnifyingTimer=null
        },null,this)
    }

    collectClock(dude,clock){
        clock.disableBody(true,true)

        this.dudeSpeed=600

        if(this.clockTimer){
            this.clockTimer.remove(false)
        }
        //5s delay
        this.magnifyingTimer=this.time.delayedCall(5000,()=>{
            this.dudeSpeed=300
            this.clockTimer=null
        },null,this)
    }

    update(){
        if(this.cursors.left.isDown){
            this.dude.body.velocity.x= -this.dudeSpeed
            this.dude.anims.play("left",true)
        }

        else if(this.cursors.right.isDown){
            this.dude.body.velocity.x= this.dudeSpeed
            this.dude.anims.play("right",true)
        }

        else{
            this.dude.body.velocity.x= 0
            this.dude.anims.play("turn",true)
        }

        if(this.cursors.up.isDown && this.dude.body.touching.down){
            this.dude.body.velocity.y= -gameOptions.dudeGravity/1.6
        }


        if(this.dude.y>game.config.height ){
            this.scene.start("PlayGame")
            this.timer=0
        }

        if (this.dude.y < 0) {
            this.dude.y = 0;
            this.dude.body.velocity.y = 0;
        }

        if(this.dude.x >game.config.width){
            this.dude.x=0
        }

        if(this.dude.x <0){
            this.dude.x=game.config.width //800 in this case
        }



        this.timer += this.game.loop.delta / 1000
        this.showTimer.setText(Math.floor(this.timer)+"s");
    }



}