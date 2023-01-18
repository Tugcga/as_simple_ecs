import { Signature } from "./signature";
import { Entity } from "./types";
import { ECS } from "./simple_ecs";

export abstract class System {
    private m_entities: Set<Entity> = new Set<Entity>();
    private m_entities_array: Array<Entity> = new Array<Entity>();
    private m_ecs: ECS | null = null;

    abstract update(dt: f32): void;

    set_ecs(ecs: ECS): void {
        this.m_ecs = ecs;
    }

    entities(): Array<Entity> {
        return this.m_entities_array;
    }

    delete_entity(entity: Entity): void {
        const ent_count = this.m_entities.size;

        this.m_entities.delete(entity);

        if(this.m_entities.size != ent_count) {
            this.m_entities_array = this.m_entities.values();
        }
    }

    add_entity(entity: Entity): void {
        const ent_count = this.m_entities.size;

        this.m_entities.add(entity);

        if(this.m_entities.size != ent_count) {
            this.m_entities_array = this.m_entities.values();
        }
    }

    get_component<T>(entity: Entity): T | null {
        let local_ecs = this.m_ecs;
        if(local_ecs) {
            return local_ecs.get_component<T>(entity);
        }
        return null;
    }
}

export class SystemManager {
    private m_signatures: Map<string, Signature> = new Map<string, Signature>();
    private m_systems: Map<string, System> = new Map<string, System>();

    register_system<T>(system: T, ecs: ECS): T {
        const type_name = nameof<T>();

        assert(!this.m_systems.has(type_name), "Registering system more than once");

        (system as System).set_ecs(ecs);

        this.m_systems.set(type_name, system as System);
        this.m_signatures.set(type_name, new Signature());

        return system;
    }

    set_signature_allow<T>(component: u32): void {
        const type_name = nameof<T>();
        assert(this.m_systems.has(type_name), "System used before registered");

        this.m_signatures.get(type_name).allow(component);
    }

    set_signature_deny<T>(component: u32): void {
        const type_name = nameof<T>();
        assert(this.m_systems.has(type_name), "System used before registered");

        this.m_signatures.get(type_name).deny(component);
    }

    private set_signature<T>(signature: Signature): void {
        const type_name = nameof<T>();

        assert(this.m_systems.has(type_name), "System used before registered");

        this.m_signatures.set(type_name, signature);
    }

    entity_destroyed(entity: Entity): void {
        const system_keys = this.m_systems.keys();
        for(let i = 0, len = system_keys.length; i < len; i++) {
            const system_name: string = system_keys[i];
            const system: System = this.m_systems.get(system_name);
            system.delete_entity(entity);
        }
    }

    entity_signature_changed(entity: Entity, entity_signature: Signature): void {
        const system_keys = this.m_systems.keys();
        for(let i = 0, len = system_keys.length; i < len; i++) {
            const system_name: string = system_keys[i];
            const system: System = this.m_systems.get(system_name);
            const system_signature: Signature = this.m_signatures.get(system_name);

            if(system_signature.is_accept(entity_signature)) {
                system.add_entity(entity);
            } else {
                system.delete_entity(entity);
            }
        }
    }

    update_systems(dt: f32): void {
        const system_keys = this.m_systems.keys();
        for(let i = 0, len = system_keys.length; i < len; i++) {
            const system_name: string = system_keys[i];
            const system: System = this.m_systems.get(system_name);

            system.update(dt);
        }
    }

    get_entities<T>(): Array<Entity> {
        const system_name: string = nameof<T>();

        assert(this.m_systems.has(system_name), "The system is not registered");

        const system: System = this.m_systems.get(system_name);
        return system.entities();
    }
}