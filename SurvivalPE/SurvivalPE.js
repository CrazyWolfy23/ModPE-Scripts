//Mod By CrazyWolfy23

/*
This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. 
To view a copy of this license, 
visit http://creativecommons.org/licenses/by-sa/4.0/.
*/

/*
TODO
===============
-GUI
-Textures
-Block Rotations
-Proper Block Breaking, (Support for tools)

-Fully Add Tanks (Injection into pipes)
-Fully Add Spin Wheels (Injection into pipes)

-Machines:
	-Liquid Pump: Pumps liquids into tanks, machines, and pipes.
	-Electric Furnace
	-Block Placer
	-Block Destroyer
*/

/*
Latest Update
================
-Steam Boilers Now Inject Steam Into Pipes.
-Added Tank Stuff.
-Cleaned Code.
-Reworked Steam Pipes, Energy Pipes Later.
*/

var version = "0.1.9.1";
var blockPos;
var timer;

var SurvivalPE = {
	multiblockGen:{
		boiler:{},
		steamConverter:{}
	},
	generators:{
		coal:{},
		lava:{},
		gunpowder:{},
		solar:{},
		steam:{}
	},
	machines:{
		electicFurnace:{}
	},
	pipes:{
		steam:{},
		energy:{},
		steamData:0,
		steamExData:1,
		energyData:2,
		energyExData:3
	},
	storage:{
		liquid:{},
		energy:{}
	},
	liquidType:{
		nothing:0,
		water:1,
		lava:2,
		steam:3
	},
	energyType:{
		basic:0,
		advanced:1
	},
	boilerMaxCoal:16,
	boilerMaxWater:1000,
	boilerMaxSteam:2000,
	steamConverterMaxSteam:1000,
	steamConverterMaxEnergy:1000,
	coalGenMaxCoal:16,
	coalGenMaxEnergy:1000,
	lavaGenMaxLava:1000,
	lavaGenMaxEnergy:1000,
	gunpowderGenMaxGunpowder:16,
	gunpowderGenMaxEnergy:1000,
	solarGenStartTime:0,
	solarGenEndTime:10000,
	solarGenMaxEnergy:1000,
	steamGenMaxWater:1000,
	steamGenMaxCoal:16,
	steamGenMaxEnergy:1000,
	steamPipeMaxSteam:200,
	steamPipeExMaxSteam:100,
	energyPipeMaxEnergy:500,
	energyPipeExMaxEnergy:250,
	energyStorageMaxEnergy:10000,
	liquidStorageMaxAmount:10000
}
var id = {
	block:{
		boiler:33,
		steamConverter:34,
		coalGen:36,
		lavaGen:43,
		gunpowderGen:54,
		solarGen:55,
		steamGen:69,
		electicFurnace:70,
		pipe1:71,
		pipe2:72,
		pipe3:74,
		pipe4:75,
		liquidStorage:76,
		energyStorage:77
	},
	item:{
		pipeSteam:500,
		pipeSteamExtraction:501,
		pipeEnergy:502,
		pipeEnergyExtraction:503,
		wrenchBlue:504, //Rotates
		wrenchRed:505	//Destroys
	}
}

ModPE.setItem(id.item.pipeSteam,"pipe_steam",0,"Steam Pipe");
ModPE.setItem(id.item.pipeSteamExtraction,"pipe_steam_extraction",0,"Steam Extraction Pipe");
ModPE.setItem(id.item.pipeEnergy,"pipe_energy",0,"Energy Pipe");
ModPE.setItem(id.item.pipeEnergyExtraction,"pipe_energy_extraction",0,"Energy Extraction Pipe");
ModPE.setItem(id.item.wrenchBlue,"wrench_blue",0,"Blue Wrench");
ModPE.setItem(id.item.wrenchRed,"wrench_red",0,"Red Wrench");

Block.defineBlock(id.block.boiler,"Steam Boiler",[["steam_boiler_top",0],["steam_boiler_side",0],["steam_boiler_front",0],["steam_boiler_side",0],["steam_boiler_side",0],["steam_boiler_side",0]]);
Block.defineBlock(id.block.steamConverter,"Steam Converter",[]);
Block.defineBlock(id.block.coalGen,"Coal Generator",[]);
Block.defineBlock(id.block.lavaGen,"Lava Generator",[]);
Block.defineBlock(id.block.gunpowderGen,"Gunpowder Generator",[]);
Block.defineBlock(id.block.solarGen,"Solar Generator",[]);
Block.defineBlock(id.block.steamGen,"Steam Generator",[]);
Block.defineBlock(id.block.electicFurnace,"Electric Furnace",[]);
Block.defineBlock(id.block.pipe1,"pipe1",[],7,false,0);
Block.defineBlock(id.block.pipe2,"pipe2",[],7,false,0);
Block.defineBlock(id.block.pipe3,"pipe3",[],7,false,0);
Block.defineBlock(id.block.pipe4,"pipe4",[],7,false,0);
Block.defineBlock(id.block.liquidStorage,"Tank",[]);
Block.defineBlock(id.block.energyStorage,"Spin Wheel",[]);

Block.setShape(id.block.pipe1,0.25,0.25,0.25,0.75,0.75,0.75);
Block.setShape(id.block.pipe2,-0.25,0.25,0.25,1.25,0.75,0.75);
Block.setShape(id.block.pipe3,0.25,0.25,-0.25,0.75,0.75,1.25);
Block.setShape(id.block.pipe4,0.25,-0.25,0.25,0.75,1.25,0.75);

function newLevel(){
	loadVariables();
}

function leaveGame(){
	saveVariables();
}

function useItem(x,y,z,itemId,blockId,side,itemDmg,blockDmg){
	blockPos = getTrueXYZ(x,y,z,side);
	
	//Tank
	if(itemId == id.block.liquidStorage){
		if(!SurvivalPE.storage.liquid[blockPos]){
			SurvivalPE.storage.liquid[blockPos] = {
				x:x,
				y:y,
				z:z,
				type:SurvivalPE.liquidType.nothing,
				amount:0
			}
		}
	}
	
	//Spin Wheel
	if(itemId == id.block.energyStorage){
		if(!SurvivalPE.storage.energy[blockPos]){
			SurvivalPE.storage.energy[blockPos] = {
				x:x,
				y:y,
				z:z,
				type:basic,
				energy:0
			}
		}
	}
	
	//Steam Pipe
	if(itemId == id.item.pipeSteam){
		placePipe(SurvivalPE.pipes.steamData,x,y,z);
		Entity.setCarriedItem(Player.getEntity(), Player.getCarriedItem(), Player.getCarriedItemCount()-1,0);
		if(!SurvivalPE.pipes.steam[blockPos]){
			SurvivalPE.pipes.steam[blockPos] = {
				x:x,
				y:y,
				z:z,
				type:SurvivalPE.pipes.steamData,
				steam:0
			}
		}
	}
	
	//Extraction Steam Pipe
	if(itemId == id.item.pipeSteamExtraction){
		placePipe(SurvivalPE.pipes.steamExData,x,y,z);
		Entity.setCarriedItem(Player.getEntity(), Player.getCarriedItem(), Player.getCarriedItemCount()-1,0);
		if(!SurvivalPE.pipes.steam[blockPos]){
			SurvivalPE.pipes.steam[blockPos] = {
				x:x,
				y:y,
				z:z,
				type:SurvivalPE.pipes.steamExData,
				steam:0
			}
		}
	}
	
	//Energy Pipe
	if(itemId == id.item.pipeEnergy){
		placePipe(SurvivalPE.pipes.energyData,x,y,z);
		Entity.setCarriedItem(Player.getEntity(), Player.getCarriedItem(), Player.getCarriedItemCount()-1,0);
		if(!SurvivalPE.pipes.energy[blockPos]){
			SurvivalPE.pipes.energy[blockPos] = {
				x:x,
				y:y,
				z:z,
				type:SurvivalPE.pipes.energyData,
				energy:0
			}
		}
	}
	
	//Extraction Energy Pipe
	if(itemId == id.item.pipeEnergyExtraction){
		placePipe(SurvivalPE.pipes.energyExData,x,y,z);
		Entity.setCarriedItem(Player.getEntity(), Player.getCarriedItem(), Player.getCarriedItemCount()-1,0);
		if(!SurvivalPE.pipes.energy[blockPos]){
			SurvivalPE.pipes.energy[blockPos] = {
				x:x,
				y:y,
				z:z,
				type:SurvivalPE.pipes.energyExData,
				energy:0
			}
		}
	}
	
	//Multiblock Boiler
	if(itemId == id.block.boiler){
		if(!SurvivalPE.multiblockGen.boiler[blockPos]){
			SurvivalPE.multiblockGen.boiler[blockPos] = {
				x:x,
				y:y,
				z:z,
				water:0,
				coal:0,
				timer:0,
				steam:0
			}
		}
	}
	if(blockId == id.block.boiler){
		if(itemId == 263 && SurvivalPE.multiblockGen.boiler[[x,y,z]].coal < SurvivalPE.boilerMaxCoal){
			SurvivalPE.multiblockGen.boiler[[x,y,z]].coal++;
			Entity.setCarriedItem(Player.getEntity(), 263, Player.getCarriedItemCount()-1,0);
		}
		if(itemId == 325 && itemDmg == 8 && (SurvivalPE.multiblockGen.boiler[[x,y,z]].water+999) < SurvivalPE.boilerMaxWater){
			SurvivalPE.multiblockGen.boiler[[x,y,z]].water+=1000;
			Player.addItemInventory(325,1,0);
		}
	}
	
	//Multiblock Steam Converter
	if(itemId == id.block.steamConverter){
		if(!SurvivalPE.multiblockGen.steamConverter[blockPos]){
			SurvivalPE.multiblockGen.steamConverter[blockPos] = {
				x:x,
				y:y,
				z:z,
				steam:0,
				timer:0,
				energy:0
			}
		}
	}
	
	//Coal Generator
	if(itemId == id.block.coalGen){
		if(!SurvivalPE.generators.coalGen[blockPos]){
			SurvivalPE.generators.coalGen[blockPos] = {
				x:x,
				y:y,
				z:z,
				coal:0,
				timer:0,
				energy:0
			}
		}
	}
	if(blockId == id.block.coalGen){
		if(itemId == 263 && SurvivalPE.generators.coalGen[[x,y,z]].coal < SurvivalPE.coalGenMaxCoal){
			SurvivalPE.generators.coalGen[[x,y,z]].coal++;
			Entity.setCarriedItem(Player.getEntity(), 263, Player.getCarriedItemCount()-1,0);
		}
	}
	
	//Lava Generator
	if(itemId == id.block.lavaGen){
		if(!SurvivalPE.generators.lavaGen[blockPos]){
			SurvivalPE.generators.lavaGen[blockPos] = {
				x:x,
				y:y,
				z:z,
				lava:0,
				timer:0,
				energy:0
			}
		}
	}
	if(blockId == id.block.lavaGen){
		if(itemId == 325 && itemDmg == 10 && (SurvivalPE.generators.lavaGen[[x,y,z]].lava+999) < SurvivalPE.lavaGenMaxLava){
			SurvivalPE.generators.lavaGen[[x,y,z]].lava+=1000;
			Entity.setCarriedItem(Player.getEntity(), 325, Player.getCarriedItemCount()-1,10);
			Player.addItemInventory(325,1,0);
		}
	}
	
	//Gunpowder Generator
	if(itemId == id.block.gunpowderGen){
		if(!SurvivalPE.generators.gunpowderGen[blockPos]){
			SurvivalPE.generators.gunpowderGen[blockPos] = {
				x:x,
				y:y,
				z:z,
				gunpowder:0,
				timer:0,
				energy:0
			}
		}
	}
	if(blockId == id.block.gunpowderGen){
		if(itemId == 289 && SurvivalPE.generators.gunpowderGen[[x,y,z]].gunpowder < SurvivalPE.gunpowderGenMaxGunpowder){
			SurvivalPE.generators.gunpowderGen[[x,y,z]].gunpowder++;
			Entity.setCarriedItem(Player.getEntity(), 289, Player.getCarriedItemCount()-1,0);
		}
	}
	
	//Solar Generator
	if(itemId == id.block.solarGen){
		if(!SurvivalPE.generators.solarGen[blockPos]){
			SurvivalPE.generators.solarGen[blockPos] = {
				x:x,
				y:y,
				z:z,
				energy:0
			}
		}
	}
	
	//Steam Generator
	if(itemId == id.block.steamGen){
		if(!SurvivalPE.generators.steamGen[blockPos]){
			SurvivalPE.generators.steamGen[blockPos] = {
				x:x,
				y:y,
				z:z,
				water:0,
				coal:0,
				bTimer:0,
				steam:0,
				sTimer:0,
				energy:0
			}
		}
	}
	if(blockId == id.block.steamGen){
		if(itemId == 263 && SurvivalPE.generators.steamGen[[x,y,z]].coal < SurvivalPE.steamGenMaxCoal){
			SurvivalPE.generators.steamGen[[x,y,z]].coal++;
			Entity.setCarriedItem(Player.getEntity(), 263, Player.getCarriedItemCount()-1,0);
		}
		if(itemId == 325 && itemDmg == 8 && (SurvivalPE.generators.steamGen[[x,y,z]].water+999) < SurvivalPE.steamGenMaxWater){
			SurvivalPE.generators.steamGen[[x,y,z]].water+=1000;
			Player.addItemInventory(325,1,0);
		}
	}
}

function destroyBlock(x,y,z,side){
	var blockId = Player.getPointedBlockId();
	var blockDmg = Player.getPointedBlockDamage();
	
	//Multiblock Boiler
	if(blockId == id.block.boiler && SurvivalPE.multiblockGen.boiler[[x,y,z]]){
		if(SurvivalPE.multiblockGen.boiler[[x,y,z]].coal > 0){
			Level.dropItem(x,y,z,0,263,SurvivalPE.multiblockGen.boiler[[x,y,z]].coal);
		}
		delete SurvivalPE.multiblockGen.boiler[[x,y,z]];
	}
	
	//Multiblock Steam Converter
	if(blockId == id.block.steamConverter && SurvivalPE.multiblockGen.steamConverter[[x,y,x]]){
		delete SurvivalPE.multiblockGen.steamConverter[[x,y,z]];
	}
	
	//Coal Generator
	if(blockId == id.block.coalGen && SurvivalPE.generators.coalGen[[x,y,z]]){
		if(SurvivalPE.generators.coalGen[[x,y,z]].coal > 0){
			Level.dropItem(x,y,z,0,263,SurvivalPE.generators.coalGen[[x,y,z]].coal);
		}
		delete SurvivalPE.generators.coalGen[[x,y,z]];
	}
	
	//Lava Generator
	if(blockId == id.block.lavaGen && SurvivalPE.generators.lavaGen[[x,y,z]]){
		delete SurvivalPE.generators.lavaGen[[x,y,z]];
	}
	
	//Gunpowder Generator
	if(blockId == id.block.gunpowderGen && SurvivalPE.generators.gunpowderGen[[x,y,z]]){
		if(SurvivalPE.generators.gunpowderGen[[x,y,z]].gunpowder > 0){
			Level.dropItem(x,y,z,0,289,SurvivalPE.generators.gunpowderGen[[x,y,z]].gunpowder);
		}
		delete SurvivalPE.generators.gunpowderGen[[x,y,z]];
	}
	
	//Solar Generator
	if(blockId == id.block.solarGen && SurvivalPE.generators.solarGen[[x,y,z]]){
		delete SurvivalPE.generators.solarGen[[x,y,z]];
	}
	
	//Steam Generator
	if(blockId == id.block.steamGen && SurvivalPE.generators.steamGen[[x,y,z]]){
		if(SurvivalPE.generators.steamGen[[x,y,z]].coal > 0){
			Level.dropItem(x,y,z,0,263,SurvivalPE.generators.steamGen[[x,y,z]].coal);
		}
		delete SurvivalPE.generators.steamGen[[x,y,z]];
	}
	
	//Steam Pipe
	if(isWire(x,y,z) && blockDmg == SurvivalPE.pipes.steamData){
		delete SurvivalPE.pipes.steam[[x,y,z]];
	}
	
	//Steam Extraction Pipe
	if(isWire(x,y,z) && blockDmg == SurvivalPE.pipes.steamExData){
		delete SurvivalPE.pipes.steam[[x,y,z]];
	}
	
	//Energy Pipe
	if(isWire(x,y,z) && blockDmg == SurvivalPE.pipes.energyData){
		delete SurvivalPE.pipes.energy[[x,y,z]];
	}
	
	//Energy Extraction Pipe
	if(isWire(x,y,z) && blockDmg == SurvivalPE.pipes.energyExData){
		delete SurvivalPE.pipes.energy[[x,y,z]];
	}
}

function modTick(){
	timer++;
	
	//Multiblock Boiler
	for(blockPos in SurvivalPE.multiblockGen.boiler){
		if(SurvivalPE.multiblockGen.boiler[blockPos].coal > 0 && SurvivalPE.multiblockGen.boiler[blockPos].timer == 0 && SurvivalPE.multiblockGen.boiler[blockPos].steam < SurvivalPE.boilerMaxSteam && SurvivalPE.multiblockGen.boiler[blockPos].water > 999){
			SurvivalPE.multiblockGen.boiler[blockPos].coal--;
			SurvivalPE.multiblockGen.boiler[blockPos].water-=100;
			SurvivalPE.multiblockGen.boiler[blockPos].timer+=200;
		}
		if(SurvivalPE.multiblockGen.boiler[blockPos].timer > 0){
			SurvivalPE.multiblockGen.boiler[blockPos].timer--;
			if(SurvivalPE.multiblockGen.boiler[blockPos].steam < SurvivalPE.boilerMaxSteam){
				SurvivalPE.multiblockGen.boiler[blockPos].steam++;
			}
		}
		
		if(SurvivalPE.multiblockGen.boiler[blockPos].steam > 99 && isWire(SurvivalPE.multiblockGen.boiler[blockPos].x,SurvivalPE.multiblockGen.boiler[blockPos].y+1,SurvivalPE.multiblockGen.boiler[blockPos].z) && SurvivalPE.pipes.steam[[SurvivalPE.multiblockGen.boiler[blockPos].x,SurvivalPE.multiblockGen.boiler[blockPos].y+1,SurvivalPE.multiblockGen.boiler[blockPos].z]]){
			if((SurvivalPE.pipes.steam[[SurvivalPE.multiblockGen.boiler[blockPos].x,SurvivalPE.multiblockGen.boiler[blockPos].y+1,SurvivalPE.multiblockGen.boiler[blockPos].z]].steam+100) < SurvivalPE.steamPipeExMaxSteam){
				SurvivalPE.pipes.steam[[SurvivalPE.multiblockGen.boiler[blockPos].x,SurvivalPE.multiblockGen.boiler[blockPos].y+1,SurvivalPE.multiblockGen.boiler[blockPos].z]].steam+=100;
			}
		}
	}
	
	//Multiblock Steam Converter
	for(blockPos in SurvivalPE.multiblockGen.steamConverter){
		if(SurvivalPE.multiblockGen.steamConverter[blockPos].steam > 99 && SurvivalPE.multiblockGen.steamConverter[blockPos].timer == 0 && SurvivalPE.multiblockGen.steamConverter[blockPos].energy < SurvivalPE.steamConverterMaxEnergy){
			SurvivalPE.multiblockGen.steamConverter[blockPos].steam-=100;
			SurvivalPE.multiblockGen.steamConverter[blockPos].timer+=50;
		}
		if(SurvivalPE.multiblockGen.steamConverter[blockPos].timer > 0){
			SurvivalPE.multiblockGen.steamConverter[blockPos].timer--;
			if(SurvivalPE.multiblockGen.steamConverter[blockPos].energy < SurvivalPE.steamConverterMaxEnergy){
				SurvivalPE.multiblockGen.steamConverter[blockPos].energy++;
			}
		}
	}
	
	//Coal Generator
	for(blockPos in SurvivalPE.generators.coal){
		if(SurvivalPE.generators.coal[blockPos].coal > 0 && SurvivalPE.generators.coal[blockPos].timer == 0 && SurvivalPE.generators.coal[blockPos].energy < SurvivalPE.coalGenMaxEnergy){
			SurvivalPE.generators.coal[blockPos].coal--;
			SurvivalPE.generators.coal[blockPos].timer+=250;
		}
		if(SurvivalPE.generators.coal[blockPos].timer > 0){
			SurvivalPE.generators.coal[blockPos].timer--;
			if(SurvivalPE.generators.coal[blockPos].energy < SurvivalPE.coalGenMaxEnergy){
				SurvivalPE.generators.coal[blockPos].energy++;
			}
		}
	}
	
	//Lava Generator
	for(blockPos in SurvivalPE.generators.lavaGen){
		if(SurvivalPE.generators.lavaGen[blockPos].lava > 999 && SurvivalPE.generators.lavaGen[blockPos].timer == 0 && SurvivalPE.generators.lavaGen[blockPos].energy < SurvivalPE.lavaGenMaxEnergy){
			SurvivalPE.generators.lavaGen[blockPos].lava-=1000;
			SurvivalPE.generators.lavaGen[blockPos].timer+=250
		}
		if(SurvivalPE.generators.lavaGen[blockPos].timer > 0){
			SurvivalPE.generators.lavaGen[blockPos].timer--;
			if(SurvivalPE.generators.lavaGen[blockPos].energy+1 < SurvivalPE.lavaGenMaxEnergy){
				SurvivalPE.generators.lavaGen[blockPos].energy+=2;
			}
		}
	}
	
	//Gunpowder Generator
	for(blockPos in SurvivalPE.generators.gunpowderGen){
		if(SurvivalPE.generators.gunpowderGen[blockPos].gunpowder > 0 && SurvivalPE.generators.gunpowderGen[blockPos].timer == 0 && SurvivalPE.generators.gunpowderGen[blockPos].energy < SurvivalPE.gunpowderGenMaxEnergy){
			SurvivalPE.generators.gunpowderGen[blockPos].gunpowder--;
			SurvivalPE.generators.gunpowderGen[blockPos].timer+=250;
		}
		if(SurvivalPE.generators.gunpowderGen[blockPos].timer > 0){
			SurvivalPE.generators.gunpowderGen[blockPos].timer--;
			if(SurvivalPE.generators.gunpowderGen[blockPos].energy+1 < SurvivalPE.gunpowderGenMaxEnergy){
				SurvivalPE.generators.gunpowderGen[blockPos].energy++;
			}
		}
	}
	
	//Solar Generator
	for(blockPos in SurvivalPE.generators.solarGen){
		if(Level.getTimer() > SurvivalPE.solarGenStartTime && Level.getTime() < SurvivalPE.solarGenEndTime && SurvivalPE.generators.solarGen[blockPos].energy < SurvivalPE.solarGenMaxEnergy){
			SurvivalPE.generators.solarGen[blockPos].energy++;
		}
	}
	
	//Steam Generator
	for(blockPos in SurvivalPE.generators.steamGen){
		if(SurvivalPE.generators.steamGen[blockPos].coal > 0 && SurvivalPE.generators.steamGen[blockPos].water > 999 && SurvivalPE.generators.steamGen[blockPos].bTimer == 0 && SurvivalPE.generators.steamGen[blockPos].steam < SurvivalPE.steamGenMaxSteam){
			SurvivalPE.generators.steamGen[blockPos].coal--;
			SurvivalPE.generators.steamGen[blockPos].water-=1000;
			SurvivalPE.generators.steamGen[blockPos].bTimer+=250;
		}
		if(SurvivalPE.generators.steamGen[blockPos].bTimer > 0){
			SurvivalPE.generators.steamGen[blockPos].bTimer--;
			if(SurvivalPE.generators.steamGen[blockPos].steam < SurvivalPE.steamGenMaxSteam){
				SurvivalPE.generators.steamGen[blockPos].steam++;
			}
		}
		if(SurvivalPE.generators.steamGen[blockPos].steam > 99 && SurvivalPE.generators.steamGen[blockPos].sTimer == 0 && SurvivalPE.generators.steamGen[blockPos].energy < SurvivalPE.steamGenMaxEnergy){
			SurvivalPE.generators.steamGen[blockPos].steam-=100;
			SurvivalPE.generators.steamGen[blockPos].sTimer+=250;
		}
		if(SurvivalPE.generators.steamGen[blockPos].sTimer > 0){
			SurvivalPE.generators.steamGen[blockPos].sTimer--;
			if(SurvivalPE.generators.steamGen[blockPos].energy < SurvivalPE.steamGenMaxEnergy){
				SurvivalPE.generators.steamGen[blockPos].energy++;
			}
		}
	}
	
	//Steam Pipes
	for(blockPos in SurvivalPE.pipes.steam){
		if(timer == 20){
			if(SurvivalPE.pipes.steam[blockPos].steam > 0){
				if(SurvivalPE.pipes.steam[blockPos].steam > 100){
					sendSteam(SurvivalPE.pipes.steam[blockPos].x,SurvivalPE.pipes.steam[blockPos].y,SurvivalPE.pipes.steam[blockPos].x,SurvivalPE.pipes.steam[blockPos].steam);
				}else{
					sendSteam(SurvivalPE.pipes.steam[blockPos].x,SurvivalPE.pipes.steam[blockPos].y,SurvivalPE.pipes.steam[blockPos].x,100);
				}
			}
		}
	}
	
	if(timer == 20) timer = 0;
}

function sendEnergy(x,y,z,xx,yy,zz,energy){
	var sides=[[x,y-1,z],[x,y+1,z],[x,y,z-1],[x,y,z+1],[x-1,y,z],[x+1,y,z]];
	if(isWire(x,y,z)){
		var amt = 0;
		var places = [];
		for(var i = 0; i<sides.length; i++){
			var sx = sides[i][0];
			var sy = sides[i][1];
			var sz = sides[i][2];
			var tile = Level.getTile(sx,sy,sz);
			var data = Level.getData(sx,sy,sz);
			if([xx,yy,zz] != [sx,sy,sz] && ((isWire(sx,sy,sz) && data == SurvivalPE.pipes.energyData) || tile == id.block.energyStorage)){
				amt++;
				places.push([sides[i][0],sides[i][1],sides[i][2]]);
			}
		}
		if(amt > 0){
			var rnd = Math.floor(Math.random()*places.length);
			if(isWire(places[rnd])){
				sendEnergy(places[rnd][0],places[rnd][1],places[rnd][2],x,y,z,energy);
			}
			if(Level.getTile(places[rnd][0],places[rnd][1],places[rnd][2]) == id.block.energyStorage && (SurvivalPE.storage.energy[places[rnd]].energy+energy) <= SurvivalPE.energyStorageMaxEnergy){
				SurvivalPE.storage.energy[places[rnd]].energy+=energy;
			}
		}
	}
}

function sendSteam(x,y,z,steam){
	var sides=[[x,y-1,z],[x,y+1,z],[x,y,z-1],[x,y,z+1],[x-1,y,z],[x+1,y,z]];
	if(isWire(x,y,z)){
		var amt = 0;
		var places = [];
		for(var i = 0; i<sides.length; i++){
			var sx = sides[i][0];
			var sy = sides[i][1];
			var sz = sides[i][2];
			var tile = Level.getTile(sx,sy,sz);
			var data = Level.getData(sx,sy,sz);
			if(((isWire(sx,sy,sz) && data == SurvivalPE.pipes.steamData) || tile == id.block.steamConverter || id.block.liquidStorage)){
				amt++;
				places.push([sides[i][0],sides[i][1],sides[i][2]]);
			}
		}
		if(amt > 0){
			var rnd = Math.floor(Math.random()*places.length);
			if(isWire(places[rnd][0],places[rnd][1],places[rnd][2]) && (SurvivalPE.pipes.steam[places[rnd]].steam+steam) < SurvivalPE.steamPipeMaxSteam){
				SurvivalPE.pipes.steam[[x,y,z]].steam-=steam;
				SurvivalPE.pipes.steam[places[rnd]].steam+=steam;
			}
			
			if(Level.getTile(places[rnd][0],places[rnd][1],places[rnd][2]) == id.block.steamConverter && (SurvivalPE.multiblockGen.steamConverter[places[rnd]].steam+steam) <= SurvivalPE.steamConverterMaxSteam){
				SurvivalPE.pipes.steam[[x,y,z]].steam-=steam;
				SurvivalPE.multiblockGen.steamConverter[places[rnd]].steam+=steam;
			}
			
			if(Level.getTile(places[rnd][0],places[rnd][1],places[rnd][2]) == id.block.liquidStorage && (SurvivalPE.storage.liquid[places[rnd]].amount+steam) < SurvivalPE.liquidStorageMaxAmount && SurvivalPE.storage.liquid[places[rnd]].type == (SurvivalPE.liquidType.nothing || SurvivalPE.liquidType.steam)){
				SurvivalPE.pipes.steam[[x,y,z]].steam-=steam;
				SurvivalPE.storage.liquid[places[rnd]].amount+=steam;
				if(SurvivalPE.storage.liquid[places[rnd]].type == SurvivalPE.liquidType.nothing){
					SurvivalPE.storage.liquid[places[rnd]].type = SurvivalPE.liquidType.steam;
				}
			}
		}
	}
}

function placePipe(type,x,y,z){
	var sides=[[x,y-1,z],[x,y+1,z],[x,y,z-1],[x,y,z+1],[x-1,y,z],[x+1,y,z]];
	var hasPlaced = false;
	for(var i = 0; i<sides.length; i++){
		var a;
		if(i == 0 || i == 1){
			a = id.block.pipe4;
		}
		else if(i == 2 || i == 3){
			a = id.block.pipe3;
		}
		else if(i == 4 || i == 5){
			a = id.block.pipe2
		}
		
		if(isWire(sides[i][0],sides[i][1],sides[i][2])){
			hasPlaced = true;
			Level.setTile(x,y,z,a,type);
		}
	}
	if(hasPlaced == false){
		Level.setTile(x,y,z,id.block.pipe1,type);
	}
}

function isWire(x,y,z){
	if(Level.getTile(x,y,z) == id.block.pipe1 || Level.getTile(x,y,z) == id.block.pipe2 || Level.getTile(x,y,z) == id.block.pipe3 || Level.getTile(x,y,z) == id.block.pipe4){
		return true;
	}
}

function getTrueXYZ(x,y,z,side){
	if(side == 0) y = y - 1;
	else if(side == 1) y = y + 1;
	else if(side == 2) z = z - 1;
	else if(side == 3) z = z + 1;
	else if(side == 4) x = x - 1;
	else if(side == 5) x = x + 1;
	return [x,y,z];
}

loadVariables=function(){
	java.io.File(new java.io.File(new android.os.Environment.getExternalStorageDirectory().getPath()+"/games/com.mojang/minecraftworlds/"+Level.getWorldDir()+"/SurvivalPE")).mkdirs();
	var data=new java.io.File(new android.os.Environment.getExternalStorageDirectory().getPath()+"/games/com.mojang/minecraftworlds/"+Level.getWorldDir()+"/SurvivalPE/Variables.txt");
	if(!data.exists()) return false; data.createNewFile();
	var fos=new java.io.FileInputStream(data);
	var str=new java.lang.StringBuilder(); var ch;
	while((ch=fos.read())!=-1) str.append(java.lang.Character(ch));
	SurvivalPE=JSON.parse(String(str.toString())); fos.close();
}

saveVariables=function(){
	var data=new java.io.File(new android.os.Environment.getExternalStorageDirectory().getPath()+"/games/com.mojang/minecraftworlds/"+Level.getWorldDir()+"/SurvivalPE/Variables.txt");
	if(data.exists()) data.delete(); data.createNewFile();
	var outWrite=new java.io.OutputStreamWriter(new java.io.FileOutputStream(data));
	outWrite.append(JSON.stringify(machines)); outWrite.close();
	SurvivalPE={};
}