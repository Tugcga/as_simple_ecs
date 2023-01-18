## What is it

This is simple implementation of the ECS (Entity Component System) pattern for [AssemblyScript](https://www.assemblyscript.org/). Made by using [this](https://austinmorlan.com/posts/entity_component_system/) tutorial. Of course, this implementation can be significant improved. The main goal was to create ECS for AssemblyScript, because I fails to find any one. Even ECS's for Typescript required many tweaks to be compatible with AssemblyScript.

## How to use

Make imports

```
import { ECS } from "./simple_ecs/simple_ecs";
import { System } from "./simple_ecs/system_manager";
import { Entity } from "./simple_ecs/types";
```

Create components. They are simple classes

```
class A { /*data fields*/ }

class B { /*data fields*/ }

class C { /*data fields*/ }
```

Create system. It is also a class, extended the base class ```System```. Each system should implement ```update``` method. At this method it's possible to get system entities by ```const entities: Array<Entity> = this.entities();```. To get component use ```const a_comp: A | null = this.get_component<A>(entity);``` 

```
class CustomSystem extends System {
    
    update(dt: number): void {
		const entities: Array<Entity> = this.entities();
		
        /* update implementation */
    }
}
```

In the main program create unique ```ECS``` object

```
const ecs: ECS = new ECS();
```

Register all required components

```
ecs.register_component<A>();
ecs.register_component<B>();
ecs.register_component<C>();
```

Also register all systems

```
ecs.register_system<CustomSystem>(new CustomSystem());
```

Define the pattern, which will be used by the system to select proper entities. You can define components, which should be on entities by ```ecs.set_system_with_component<CustomSystem, A>();```. If the system should iterate throw only entities without some component, then use ```ecs.set_system_without_component<CustomSystem, B>();```

```
ecs.set_system_with_component<CustomSystem, A>();
ecs.set_system_without_component<CustomSystem, B>();
```

Create entity

```
const entity_x: Entity = ecs.create_entity();
```

Add components to the entity

```
ecs.add_component<A>(entity_x, new A());
ecs.add_component<C>(entity_x, new C());
```

Remove component from entity

```
ecs.remove_component<A>(entity_x);
```

Destroy entity

```
ecs.destroy_entity(entity_x);
```

Update systems, define delta time as argument

```
ecs.update(0.1);
```

It's possible to obtain entities from the system

```
const system_entities: Array<Entity> = ecs.get_entities<CustomSystem>();
```