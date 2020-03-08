/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {Any, TypeC} from "./Type";
import {TypeSchema, ValidateStatusEnum} from "./TypeSchema";
import {failure, Result, success} from "aelastics-result";

export class LinkC extends TypeC<any> {
    public readonly schema: TypeSchema;
    public readonly path: string;
    private resolvedType:TypeC<any>|undefined = undefined;

    constructor(name: string , schema: TypeSchema , path: string) {
        super(name);
        this.schema = schema;
        this.path = path;
    }

    public isResolved() {
        return this.resolvedType;
    }

    public resolveType(): TypeC<any>|undefined {
        this.resolvedType = this.schema.getType(this.path);
        return this.resolvedType;
    }

    /**
     *  ToDo:  Nikola: validation assumes that external references are resolved
     */

    //

    validateLinks(traversed: Map<Any, Any>): Result<boolean> {
        if(this.schema.validateStatus === ValidateStatusEnum.invalid) {
            this.schema.validate(traversed);
        }

        if (this.resolveType() === undefined){
            return failure(new Error(`Type '${this.path}' does not exist in schema '${this.schema}'`));
        }
        return success(true);
    }


}

export const link = (schema:TypeSchema, path:string, name:string = `Link^${path}`)=> new LinkC(name, schema, path);