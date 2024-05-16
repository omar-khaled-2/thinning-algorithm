import sharp from "sharp";
import readline from "readline/promises";
import fs from "fs";

async function thinning(buffer:Buffer,width:number,height:number){

    let isChanged = true;
    const n = buffer.length

    const foregroundNeighbourCount = new Uint8Array(n);
    const transitionCount = new Uint8Array(n);


    while(isChanged){
        isChanged = false


        for(let i=0;i < n;i++){
            if(buffer[i] == 0) continue

            const x = i % width
            const y = Math.floor(i / width)

            if(x > 0){
                foregroundNeighbourCount[i-1]++
                const v = 0 ** buffer[i-1];

                if(y < height-1){
                    transitionCount[i+width] += v
                    transitionCount[i+width-1] += v
                }                
            }
            
            if(y > 0){
                foregroundNeighbourCount[i-width]++
                const v = 0 ** buffer[i-width];
                if(x > 0){
                    transitionCount[i-1] += v
                    transitionCount[i-width-1] += v
                }
            }
            


            if(x < width-1){
                foregroundNeighbourCount[i+1]++
                const v = 0 ** buffer[i+1];

        
                if(y > 0){
                    transitionCount[i-width] += v
                    transitionCount[i-width-1] += v
                }  


            }
                
            if(y < height-1){
                foregroundNeighbourCount[i+width]++;
                const v = 0 ** buffer[i+width];
                if(x < width-1){
                    transitionCount[i+1] += v
                    transitionCount[i+width+1] += v
                }


            }
            if(x > 0 && y > 0)
                foregroundNeighbourCount[i-width-1]++
            if(x < width-1 && y > 0)
                foregroundNeighbourCount[i-width+1]++
            if(x > 0 && y < height-1)
                foregroundNeighbourCount[i+width-1]++
            if(x < width-1 && y < height-1)
                foregroundNeighbourCount[i+width+1]++
        }





        for(let i=0;i < n;i++){
            if(buffer[i] === 0) continue;

            const x = i % width;
            const y = Math.floor(i / width);
            if(
                x > 0 && y > 0 && x < width-1 && y < height-1 &&
                foregroundNeighbourCount[i] >= 2 && foregroundNeighbourCount[i] <= 6 &&
                transitionCount[i] == 1
            ){
                buffer[i] = 0;
                isChanged = true;
            }
            
            foregroundNeighbourCount[i] = 0
            transitionCount[i] = 0

        }







    }

    
}









async function main() {
    const width = 300
    const height =300
    const threshold = 200
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    const file = await rl.question("input file: ")


    rl.close()
    if(!fs.existsSync(file))
        throw new Error("file not found")

    console.log("processing...")
    
    const buffer = await sharp(file)
        .flatten({ background: { r: 255, g: 255, b: 255 } }) 
        .grayscale()
        .resize({width,height,fit:"fill"})
        .raw()
        .toBuffer()


    const n = buffer.length

    for(let i=0;i < n;i++){
        if(buffer[i] < threshold) buffer[i] = 1
        else buffer[i] = 0
    }
    

    thinning(buffer,width,height)




    const imageBuffer = Buffer.alloc(buffer.length)
    for(let i=0;i < buffer.length;i++){
        if(buffer[i] === 0) imageBuffer[i] = 255
        else imageBuffer[i] = 0
    }



    await sharp(imageBuffer,{raw:{width,height,channels:1}}).jpeg().toFile("output.jpeg")


    
    
}




main()