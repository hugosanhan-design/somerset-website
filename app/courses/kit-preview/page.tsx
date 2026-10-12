'use client'
// /courses/kit-preview — the canonical exemplar of the Somerset course design system.
// Every kit piece in every state, with real course content. New courses clone what they see here.
import { useState } from 'react'
import { SomersetIcon } from '@/components/SomersetIcon'
import { CourseShell, StepHead, OptionCard, ChoiceGrid, Feedback, Dots, ResultSummary, Btn, type OptionState } from '../_kit'

const STEPS = [{ nav: 'Inicio' }, { nav: 'Vocabulario' }, { nav: 'Frases' }, { nav: 'Emparejar' }, { nav: 'Gramática' }, { nav: 'Diálogo' }, { nav: 'Hablar' }, { nav: 'Resultado' }]

const PHRASES: Array<{ id: string; es: string; en: string; icon: 'documents' | 'calendar' | 'confused' | 'speak' }> = [
  { id: 'cita', es: '¿Tengo que pedir cita previa?', en: 'Do I need to book an appointment?', icon: 'calendar' },
  { id: 'docs', es: '¿Qué documentos necesito?', en: 'Which documents do I need?', icon: 'documents' },
  { id: 'repite', es: '¿Me lo puede repetir, por favor?', en: 'Could you repeat that, please?', icon: 'confused' },
  { id: 'tarda', es: '¿Cuánto tarda?', en: 'How long does it take?', icon: 'speak' },
]

const ACCENTS = [
  { name: 'Default (racing)', accent: undefined, lt: undefined },
  { name: 'Expats · terracotta', accent: '#C4694A', lt: '#fbeee8' },
  { name: 'Sound Tech · signal', accent: '#2E8B57', lt: '#e6f3ea' },
  { name: 'Teens · heather', accent: '#8C5E9C', lt: '#f1e9f4' },
]

export default function KitPreview() {
  const [step, setStep] = useState(0)
  const [showEn, setShowEn] = useState(false)
  const [picked, setPicked] = useState<Record<string, OptionState>>({})
  const [acc, setAcc] = useState(1)
  const a = ACCENTS[acc]

  function pick(id: string) {
    setPicked(p => ({ ...p, [id]: id === 'docs' ? 'right' : 'wrong' }))
  }

  return (
    <CourseShell
      scope="kit"
      accent={a.accent} accentLt={a.lt}
      label="Design system · kit preview"
      links={[{ href: '/courses/spanish-expats', label: 'Expats' }, { href: '/student', label: 'My area', brass: true, badge: 3 }]}
      steps={STEPS} step={step} onGo={setStep} canGo={() => true}
      hero={{
        src: '/courses/spanish-expats/ayuntamiento.jpg', alt: 'Ayuntamiento de València', focus: 'center 40%',
        credit: { author: 'Diego Delso', licence: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org' },
        tag: 'Módulo 1', title: 'El primer mes', aim: 'What to expect in your first month in Spain — and the Spanish to handle it.',
        note: step === 0 ? 'Great on your phone' : undefined,
      }}
      stripLeft={<><strong>Module 1</strong> — The First Month</>}
      stripRight={<>{step} / {STEPS.length - 1} sections done</>}
    >
      {/* accent switcher — preview only */}
      <div className="ck-card ck-card--paper" style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="ck-label" style={{ margin: 0 }}>Course accent</span>
        {ACCENTS.map((x, i) => <Btn key={x.name} sm variant={i === acc ? 'accent' : 'ghost'} onClick={() => setAcc(i)}>{x.name}</Btn>)}
        <span style={{ flex: 1 }} />
        <Btn sm variant="ghost" onClick={() => setStep(s => (s + 1) % STEPS.length)}>Next step →</Btn>
      </div>

      <div className="ck-cols--60">
        <div>
          {/* intro card */}
          <section className="ck-card">
            <StepHead tag="At the office · situation 1" icon={<SomersetIcon name="government" size={44} />}
              title="Someone greets you with «Buenos días, ¿cómo está?»"
              aim="Pick the phrase you would say next. Right? It turns green at once. Wrong? Red, and you try again." />
            <p className="ck-situation">— Buenos días, ¿cómo está? ¿En qué puedo ayudarle?</p>
            <div className="ck-slot is-filled" style={{ marginTop: '1rem' }}>
              <span className="ck-slot__phrase">¿Qué documentos necesito?</span>
            </div>
            <div className="ck-slot"><span className="ck-slot__empty">Drag the right phrase here — or tap it below</span></div>
          </section>

          {/* the option grid */}
          <section className="ck-card">
            <ChoiceGrid label="Frases" sub="4 phrases · tap to choose, ▶ to listen" showEn={showEn} onToggleEn={setShowEn}>
              {PHRASES.map(ph => (
                <OptionCard key={ph.id} icon={<SomersetIcon name={ph.icon} size={40} />} text={ph.es} en={ph.en} showEn={showEn}
                  state={picked[ph.id] ?? 'idle'} onPick={() => pick(ph.id)} onPlay={() => {}} />
              ))}
            </ChoiceGrid>
            {Object.values(picked).includes('right') && <Feedback kind="win" n={2} />}
            {Object.values(picked).includes('wrong') && !Object.values(picked).includes('right') && <Feedback kind="wrong" />}
            <div className="ck-row">
              <Btn onClick={() => setPicked({})}>Reset</Btn>
              <Btn variant="accent">Siguiente →</Btn>
              <Btn variant="ghost">Skip for now</Btn>
              <Btn disabled>Disabled</Btn>
            </div>
          </section>

          {/* every card state, static */}
          <section className="ck-card">
            <StepHead tag="States" title="OptionCard, every state" />
            <ChoiceGrid>
              <OptionCard icon={<SomersetIcon name="nie" size={40} />} text="idle" en="plain" onPlay={() => {}} />
              <OptionCard icon={<SomersetIcon name="nie" size={40} />} text="selected" en="tapped, waiting" state="selected" />
              <OptionCard icon={<SomersetIcon name="correct" size={40} />} text="right" en="first time" state="right" />
              <OptionCard icon={<SomersetIcon name="wrong" size={40} />} text="wrong" en="reveals its English" state="wrong" />
              <OptionCard icon={<SomersetIcon name="documents" size={40} />} text="used" en="already placed" state="used" />
              <OptionCard icon={<SomersetIcon name="hand" size={40} />} text="lifting" en="being dragged" state="lifting" drag />
            </ChoiceGrid>
            <Feedback kind="win" n={0} />
            <Feedback kind="quiet" text="Right after a miss." revise />
            <Feedback kind="wrong" />
          </section>
        </div>

        <div>
          <section className="ck-card">
            <StepHead tag="Drill" title="Dots and counts" />
            <Dots states={['ok', 'ok', 'mid', 'bad', null, null, null, null]} now={4} count="5 / 8" />
            <p className="ck-situation">la cita previa</p>
            <div className="ck-row"><Btn variant="accent">Check</Btn><Btn variant="ghost" sm>Hint</Btn></div>
          </section>

          <div className="ck-note"><strong>En Valencia:</strong> police appointments are booked online and they are scarce. Never pay anyone who &quot;sells&quot; an appointment.</div>

          <section className="ck-card ck-card--tint">
            <StepHead tag="What you will do" title="Six short lessons" aim="In any order. Everything you finish is saved." />
            <ul className="ck-list">
              <li>Your personal paperwork route</li>
              <li>12 essential terms for documents</li>
              <li>8 key phrases for any government office</li>
              <li>The <em>poder + infinitive</em> structure</li>
            </ul>
          </section>

          <ResultSummary score={31} max={38} title="Módulo 1 completo" sub="Come back tomorrow: the words you missed will be waiting in Repaso."
            items={[{ label: 'Vocabulario', score: 11, max: 12 }, { label: 'Frases', score: 7, max: 8 }, { label: 'Emparejar', score: 6, max: 8 }, { label: 'Gramática', score: 7, max: 10 }]}>
            <div className="ck-row" style={{ justifyContent: 'center' }}><Btn variant="accent">Repaso →</Btn><Btn variant="ghost">Back to My Area</Btn></div>
          </ResultSummary>
        </div>
      </div>
    </CourseShell>
  )
}
