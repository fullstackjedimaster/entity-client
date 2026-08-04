"use client";

import { useMemo, useState } from "react";
import EntityComponent from "@/components/EntityComponent";
import type { FormMetadata } from "@/hooks/useFormMetadata";

const DEFAULT_JSON=`{
  "employee": {
    "first_name": "",
    "last_name": "",
    "employee_number": "",
    "age": 30,
    "start_date": "2024-01-01",
    "is_active": true,
    "addresses": [{ "street": "", "city": "", "state": "", "zip": "" }]
  }
}`;

type RenderedEntity={name:string;template:Record<string,unknown>;metadata:FormMetadata};
function title(name:string){return name.replace(/[_-]+/g," ").replace(/\b\w/g,c=>c.toUpperCase())}
function fieldType(value:unknown):"string"|"number"|"boolean"|"array" { if(Array.isArray(value))return "array"; if(typeof value==="number")return "number"; if(typeof value==="boolean")return "boolean"; return "string"; }
function parseEntity(text:string):RenderedEntity{
 let parsed:unknown; try{parsed=JSON.parse(text)}catch(e){throw new Error(e instanceof SyntaxError?`Invalid JSON: ${e.message}`:"Invalid JSON.")}
 if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("The JSON root must be an object.");
 const entries=Object.entries(parsed as Record<string,unknown>); if(!entries.length)throw new Error("The JSON root must contain at least one entity object.");
 const [name,value]=entries[0]; if(!value||typeof value!=="object"||Array.isArray(value))throw new Error(`The “${name}” value must be an object.`);
 const template=value as Record<string,unknown>;
 return {name,template,metadata:{entityName:name,schema:"demo",table:name,primaryKey:"id",fields:Object.entries(template).map(([key,val])=>({name:key,label:title(key),type:fieldType(val)}))}};
}
export default function EntityDemoPage(){
 const [jsonText,setJsonText]=useState(DEFAULT_JSON); const [rendered,setRendered]=useState<RenderedEntity|null>(null); const [error,setError]=useState<string|null>(null); const [submitted,setSubmitted]=useState<Record<string,unknown>|null>(null);
 const entity=useMemo(()=>rendered?.name??"",[rendered]);
 function renderForm(){try{setRendered(parseEntity(jsonText));setError(null);setSubmitted(null)}catch(c){setRendered(null);setSubmitted(null);setError(c instanceof Error?c.message:"Invalid JSON.")}}
 return <main className="page-shell"><div className="demo-grid">
  <section className="panel editor-panel"><p className="eyebrow">Entity JSON:</p><label className="form-field" htmlFor="entity-json"><textarea id="entity-json" value={jsonText} onChange={e=>{setJsonText(e.target.value);setRendered(null);setSubmitted(null);setError(null)}} spellCheck={false}/></label>{error?<p className="form-error">{error}</p>:null}<button className="button button-primary" type="button" onClick={renderForm}>Render Form</button></section>
  <section className="panel">{rendered?<><EntityComponent entity={entity} metadataOverride={rendered.metadata} templateOverride={rendered.template} submitLabel="Preview Submission" onSubmitOverride={async values=>setSubmitted(values)}/>{submitted?<div className="submission-preview"><p className="eyebrow">Latest submission</p><pre>{JSON.stringify(submitted,null,2)}</pre></div>:null}</>:<div className="entity-state"><strong>No form rendered.</strong><span>Enter a top-level entity object and click Render Form.</span></div>}</section>
 </div></main>;
}
