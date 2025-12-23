const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const prisma = new PrismaClient();

async function main(){
  try{
    const templateId = process.argv[2];
    const mappingFile = process.argv[3] || path.join(__dirname, '..', 'briefs', 'template-de-exemplo-completo.json');
    if(!templateId){
      console.error('Usage: node map_rules_to_db_ids.js <templateId> [mappingJsonFile]');
      process.exit(1);
    }

    if(!fs.existsSync(mappingFile)){
      console.error('Mapping file not found:', mappingFile);
      process.exit(1);
    }

    const mappingJson = JSON.parse(fs.readFileSync(mappingFile,'utf8'));

    // Build maps from provided JSON: support mapping by provided id and by key
    const qMetaById = {}; // provided id -> { text, key }
    const qMetaByKey = {}; // provided key -> { text, id }
    const blockMetaById = {}; // provided id -> { title, key }
    const blockMetaByKey = {}; // provided key -> { title, id }
    (mappingJson.blocks || []).forEach(b => {
      if(b.id) blockMetaById[b.id] = { title: b.title, key: b.key };
      if(b.key) blockMetaByKey[b.key] = { title: b.title, id: b.id };
      (b.questions || []).forEach(q => {
        if(q.id) qMetaById[q.id] = { text: q.text, key: q.key };
        if(q.key) qMetaByKey[q.key] = { text: q.text, id: q.id };
      });
    });

    console.log('Loaded mapping file. questions:', Object.keys(qTextById).length, 'blocks:', Object.keys(blockTitleById).length);

    const rules = await prisma.rule.findMany({ where: { templateId } });
    console.log('Found rules for template:', rules.length);

    for(const r of rules){
      let changed = false;
      let expr = null;
      try{ expr = JSON.parse(r.expression); }catch(e){ console.warn('Skipping rule (invalid expression JSON):', r.id); continue; }

      // If expression references a questionId like 'q-site-address' that is present in the mapping
      if(expr && expr.questionId){
        let dbQuestion = null;
        // If mapping JSON used provided id
        if(qMetaById[expr.questionId]){
          const meta = qMetaById[expr.questionId];
          if(meta.key){
            dbQuestion = await prisma.question.findFirst({ where: { key: meta.key, block: { templateId } } });
          }
          if(!dbQuestion && meta.text){
            dbQuestion = await prisma.question.findFirst({ where: { text: meta.text, block: { templateId } } });
          }
        }
        // If mapping JSON used key directly
        if(!dbQuestion && qMetaByKey[expr.questionId]){
          const meta = qMetaByKey[expr.questionId];
          if(meta.id){
            dbQuestion = await prisma.question.findFirst({ where: { key: expr.questionId, block: { templateId } } });
          }
          if(!dbQuestion && meta.text){
            dbQuestion = await prisma.question.findFirst({ where: { text: meta.text, block: { templateId } } });
          }
        }
        // Fallback: if expr.questionId looks like a key, try to find by key directly
        if(!dbQuestion){
          dbQuestion = await prisma.question.findFirst({ where: { key: expr.questionId, block: { templateId } } });
        }
        // Final fallback: try match by text equal to provided id
        if(!dbQuestion){
          const maybeText = qMetaById[expr.questionId]?.text || qMetaByKey[expr.questionId]?.text;
          if(maybeText){
            dbQuestion = await prisma.question.findFirst({ where: { text: maybeText, block: { templateId } } });
          }
        }
        if(dbQuestion){
          expr.questionId = dbQuestion.id;
          changed = true;
          console.log(`Mapped expression.questionId ${r.id} -> ${dbQuestion.id}`);
        } else {
          console.warn('Could not find DB question for expression id/key:', expr.questionId);
        }
      }
        if(dbQuestion){
          expr.questionId = dbQuestion.id;
          changed = true;
          console.log(`Mapped expression.questionId ${r.id} -> ${dbQuestion.id}`);
        } else {
          console.warn('Could not find DB question for text:', qText);
        }
      }

      // Map action.targetId if it refers to a block id in mapping
      let action = null;
      try{ action = JSON.parse(r.action); }catch(e){ console.warn('Skipping action mapping (invalid JSON) for rule:', r.id); }
      if(action && action.targetId){
        let dbBlock = null;
        if(blockMetaById[action.targetId]){
          const meta = blockMetaById[action.targetId];
          if(meta.title){
            dbBlock = await prisma.block.findFirst({ where: { title: meta.title, templateId } });
          }
        }
        if(!dbBlock && blockMetaByKey[action.targetId]){
          const meta = blockMetaByKey[action.targetId];
          if(meta.id){
            dbBlock = await prisma.block.findUnique({ where: { id: meta.id } });
          }
          if(!dbBlock && meta.title){
            dbBlock = await prisma.block.findFirst({ where: { title: meta.title, templateId } });
          }
        }
        // Fallback: try matching by title equal to provided id (sometimes mapping used title directly)
        if(!dbBlock){
          dbBlock = await prisma.block.findFirst({ where: { title: action.targetId, templateId } });
        }
        if(dbBlock){
          action.targetId = dbBlock.id;
          changed = true;
          console.log(`Mapped action.targetId ${r.id} -> ${dbBlock.id}`);
        } else {
          console.warn('Could not find DB block for action target id/key:', action.targetId);
        }
      }
        if(dbBlock){
          action.targetId = dbBlock.id;
          changed = true;
          console.log(`Mapped action.targetId ${r.id} -> ${dbBlock.id}`);
        } else {
          console.warn('Could not find DB block for title:', blockTitle);
        }
      }

      if(changed){
        await prisma.rule.update({ where: { id: r.id }, data: { expression: JSON.stringify(expr), action: JSON.stringify(action) } });
        console.log('Updated rule:', r.id);
      }
    }

    console.log('Mapping complete.');
  }catch(e){
    console.error('Error:', e);
  }finally{
    await prisma.$disconnect();
  }
}

main();
