import React from 'react';
import { useState, useEffect } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
 import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
 import { CSS } from '@dnd-kit/utilities'
import { Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import BlockEditor from '../components/BlockEditor'
import RuleEditor from '../components/RuleEditor'
import SortableBlock from '../components/SortableBlock'
import { Button, Input, Textarea, Checkbox, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '../components/ui'
import { ArrowLeft, Save, Send, Plus, Loader2, FileText } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

interface Block {
    id?: string
    title: string
    description?: string
    order: number
    parentId?: string | null
    questions: Question[]
}

interface Question {
    id?: string
    key?: string
    text: string
    type: string
    required: boolean
    placeholder?: string
    options?: string[]
}

interface Rule {
    id?: string
    expression: string
    action: string
}

const TemplateBuilder: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useAuth()
    const toast = useToast()
    const sensors = useSensors(useSensor(PointerSensor))

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [published, setPublished] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [allowDraftResponses, setAllowDraftResponses] = useState(false)

    const [blocks, setBlocks] = useState<Block[]>([])
    const [rules, setRules] = useState<Rule[]>([])
    const [availableQuestionKeys, setAvailableQuestionKeys] = useState<string[]>([])

    useEffect(() => {
        const load = async () => {
            if (!id || id === 'new') return
            setLoading(true)
            try {
                const res = await api.get(`/templates/${id}`)
                const tpl = res.data
                setName(tpl.name || '')
                setDescription(tpl.description || '')
                setAllowDraftResponses(Boolean(tpl.allowDraftResponses))
                const loadedBlocks = (tpl.blocks || []).map((b: any) => ({ ...b, id: b.id || crypto.randomUUID() }))
                setBlocks(loadedBlocks)
                setRules(tpl.rules || [])
                setPublished(Boolean(tpl.published))

                const keys: string[] = []
                ;(tpl.blocks || []).forEach((b: any) => {
                    ;(b.questions || []).forEach((q: any) => {
                        if (q.key) keys.push(q.key)
                    })
                })
                setAvailableQuestionKeys(keys)
            } catch (err) {
                console.error(err)
                toast({ title: t('templateBuilder.loadError') })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload = { name, description, allowDraftResponses, blocks, rules }
            if (!id || id === 'new') {
                const res = await api.post('/templates', payload)
                navigate(`/templates/${res.data.id}`)
            } else {
                await api.put(`/templates/${id}`, payload)
            }
            toast({ title: t('templateBuilder.saved') })
        } catch (err) {
            console.error(err)
            toast({ title: t('templateBuilder.saveError') })
        } finally {
            setSaving(false)
        }
    }

    const handlePublish = async () => {
        setSaving(true)
        try {
            if (id && id !== 'new') {
                await api.post(`/templates/${id}/publish`)
                setPublished(true)
                toast({ title: t('templateBuilder.published') })
            }
        } catch (err) {
            console.error(err)
            toast({ title: t('templateBuilder.publishError') })
        } finally {
            setSaving(false)
        }
    }

    const handleUnlock = async () => {
        setSaving(true)
        try {
            if (id && id !== 'new') {
                await api.post(`/templates/${id}/unlock`)
                setPublished(false)
                toast({ title: t('templateBuilder.unlocked') })
            }
        } catch (err) {
            console.error(err)
            toast({ title: t('templateBuilder.unlockError') })
        } finally {
            setSaving(false)
        }
    }

    const addBlock = () => {
        setBlocks([
            ...blocks,
            {
                id: crypto.randomUUID(),
                title: `${t('block.title')} ${blocks.length + 1}`,
                order: blocks.length,
                questions: [],
            } as Block,
        ])
    }

    const updateBlock = (index: number, updatedBlock: Block) => {
        const newBlocks = [...blocks]
        newBlocks[index] = updatedBlock
        setBlocks(newBlocks)
    }

    const removeBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index))
    }

    const addRule = () => {
        setRules([
            ...rules,
            {
                expression: '{}',
                action: '{}',
            },
        ])
    }

    const updateRule = (index: number, updatedRule: Rule) => {
        const newRules = [...rules]
        newRules[index] = updatedRule
        setRules(newRules)
    }

    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index))
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t('templateBuilder.loadingTemplate')}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header/Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/95 backdrop-blur sticky top-0 z-20 pb-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/templates')} title={t('common.back')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {id === 'new' ? t('templateBuilder.newTemplate') : t('templateBuilder.editTemplate')}
                            </h1>
                            {published && (
                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                                    {t('templates.published')}
                                </Badge>
                            )}
                        </div>
                        {id !== 'new' && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">ID: {id}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {published ? (
                        <Button variant="secondary" onClick={handleUnlock} disabled={saving} className="flex-1 sm:flex-none">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4 rotate-45" />}
                            {t('templateBuilder.unlockEdit')}
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {saving ? t('templateBuilder.saving') : t('templateBuilder.save')}
                        </Button>
                    )}

                    {user?.role === 'Admin' && id !== 'new' && !published && (
                        <Button onClick={handlePublish} disabled={saving} className="flex-1 sm:flex-none">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            {saving ? t('templateBuilder.saving') : t('templateBuilder.publish')}
                        </Button>
                    )}

                </div>
            </div>

            {/* Template Info */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('templateBuilder.templateInfo')}</CardTitle>
                    <CardDescription>{t('templateBuilder.infoDescription', 'Detalhes básicos para identificação.')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t('templateBuilder.name')} *
                        </label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('templateBuilder.namePlaceholder')} disabled={published} />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t('templateBuilder.description')}
                        </label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder={t('templateBuilder.descriptionPlaceholder')} className="resize-none" disabled={published} />
                    </div>

                    <div className="pt-2">
                        <div className="flex items-start gap-3">
                            <Checkbox id="allowDraftResponses" checked={allowDraftResponses} onCheckedChange={(v: any) => setAllowDraftResponses(Boolean(v))} disabled={published} />
                            <div>
                                <label htmlFor="allowDraftResponses" className="text-sm font-medium leading-none">
                                    {t('templateBuilder.allowDraftResponses', 'Allow draft responses')}
                                </label>
                                <p className="text-xs text-muted-foreground">{t('templateBuilder.allowDraftResponsesDesc', 'When enabled, starting a brief will snapshot the template so responses are tied to a version.')}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                    {/* Blocks */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>{t('templateBuilder.blocksAndQuestions')}</CardTitle>
                                <CardDescription>{t('templateBuilder.blocksDescription', 'Gerencie as seções e perguntas do seu template.')}</CardDescription>
                            </div>
                            <Button onClick={addBlock} size="sm" disabled={published}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('templateBuilder.addBlock')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {blocks.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                    <FileText className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                                    <p className="mt-2 text-sm text-muted-foreground">{t('templateBuilder.noBlocks')}</p>
                                    <Button onClick={addBlock} variant="outline" size="sm" className="mt-4" disabled={published}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('templateBuilder.addBlock')}
                                    </Button>
                                </div>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
                                    const { active, over } = e
                                    if (!over || active.id === over.id) return

                                    setBlocks((items) => {
                                        const oldIndex = items.findIndex((item) => item.id === active.id)
                                        const newIndex = items.findIndex((item) => item.id === over.id)
                                        if (oldIndex === -1 || newIndex === -1) return items

                                        const next = arrayMove(items, oldIndex, newIndex)
                                        next.forEach((b, i) => (b.order = i)) // Update order
                                        return next
                                    })
                                }}>
                                    <SortableContext items={blocks.map(b => b.id!)} strategy={verticalListSortingStrategy}>
                                        <div className="space-y-4">
                                            {blocks.map((block, index) => (
                                                <SortableBlock key={block.id} id={block.id!} index={index} block={block} onUpdate={(updatedBlock: Block) => updateBlock(index, updatedBlock)} onRemove={() => removeBlock(index)} disabled={published} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rules */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>{t('templateBuilder.conditionalRules')}</CardTitle>
                                <CardDescription>{t('templateBuilder.rulesDescription')}</CardDescription>
                            </div>
                            <Button onClick={addRule} size="sm" variant="secondary" disabled={published}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('templateBuilder.addRule')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {rules.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <p className="text-sm text-muted-foreground">{t('templateBuilder.noRules')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {rules.map((rule, index) => (
                                        <RuleEditor
                                            key={index}
                                            rule={rule}
                                            index={index}
                                            onUpdate={(updatedRule) => updateRule(index, updatedRule)}
                                            onRemove={() => removeRule(index)}
                                            disabled={published}
                                            availableKeys={availableQuestionKeys}
                                            blocks={blocks}
                                        />
                                    ))}
                                </div>
                            )}

                        </CardContent>
                    </Card>


            </div>
        </div>
    );
}

export default TemplateBuilder;
