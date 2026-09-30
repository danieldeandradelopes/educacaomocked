'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { EmptyState, StatusBadge } from '@/components/ui/StatusBadge';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { ErrorBlock, LoadingBlock } from '@/components/ui/PageHeader';
import { useApi, useApiList } from '@/lib/use-api';
import { formatPercent, shiftLabel, stageLabel } from '@/lib/filters';
import type { School, Student, TimelineEvent } from '@/domain/types';

const FOCUS_ALLOWED = ['docs'] as const;

interface HistoryEvent {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  event: string;
  date: string;
  detail: string;
}

function Student360Content({ studentId }: { studentId: string }) {
  const focus = useFocusParam(FOCUS_ALLOWED);
  const studentReq = useApi<Student>(`students/${studentId}`);
  const schoolsReq = useApiList<School>('schools');
  const historyReq = useApiList<HistoryEvent>('history');
  const allStudents = useApiList<Student>('students');

  const student = studentReq.data;
  const loading = studentReq.loading || schoolsReq.loading;
  const error = studentReq.error;

  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message={error} />;
  if (!student) {
    return (
      <EmptyState
        title="Aluno não encontrado"
        description="Este registro não está na API mockada."
      />
    );
  }

  const school = (schoolsReq.data ?? []).find((s) => s.id === student.schoolId);
  const timeline: TimelineEvent[] = (historyReq.data ?? [])
    .filter((h) => h.studentId === student.id)
    .map((h) => ({
      id: h.id,
      date: h.date,
      title: h.event,
      description: h.detail,
      kind: 'update' as const,
    }));
  const othersWithDocs = (allStudents.data ?? []).filter(
    (s) => s.documentsPending && s.id !== student.id,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Aluno 360º
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-[var(--color-navy)] sm:text-3xl">
            {student.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {school?.name ?? student.schoolId} · {student.grade} · {stageLabel(student.stage)} ·{' '}
            {shiftLabel(student.shift)}
          </p>
        </section>
        <Link
          href="/students"
          className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-navy)]/5"
        >
          ← Voltar à lista
        </Link>
      </div>

      <FocusBanner allowed={FOCUS_ALLOWED} />

      {focus === 'docs' && (
        <section className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/8 p-4">
          <p className="text-sm font-semibold text-[var(--color-navy)]">
            Exemplo de aluno com documentação pendente
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Outros na amostra com docs pendentes:
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {othersWithDocs.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link
                  href={`/students/${s.id}?focus=docs`}
                  className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-primary)]"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-1">
          <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
            Dados básicos
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Responsável" value={student.guardianName} />
            <Row label="Nascimento" value={student.birthDate} />
            <Row label="Bairro" value={student.neighborhood} />
            <Row label="Frequência" value={formatPercent(student.attendanceRate)} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {student.inActiveSearch && <StatusBadge tone="danger">Busca ativa</StatusBadge>}
            {student.inTutoring && <StatusBadge tone="info">Reforço</StatusBadge>}
            {student.inInclusive && <StatusBadge tone="success">Inclusão</StatusBadge>}
            {student.documentsPending && (
              <StatusBadge tone="warning">Docs pendentes</StatusBadge>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
            Acompanhamentos
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoCard
              title="Frequência"
              body={`Taxa atual de ${formatPercent(student.attendanceRate)}.`}
            />
            <InfoCard
              title="Busca ativa"
              body={
                student.inActiveSearch
                  ? 'Caso aberto com acompanhamento pedagógico.'
                  : 'Sem registro ativo.'
              }
            />
            <InfoCard
              title="Reforço escolar"
              body={student.inTutoring ? 'Participa de reforço.' : 'Não está em reforço.'}
            />
            <InfoCard
              title="Educação inclusiva"
              body={
                student.inInclusive
                  ? 'Acompanhamento especializado definido.'
                  : 'Sem acompanhamento de inclusão.'
              }
            />
            <InfoCard
              title="Documentos"
              body={
                student.documentsPending
                  ? 'Há pendências documentais.'
                  : 'Documentação completa na amostra.'
              }
            />
            <InfoCard
              title="Transporte"
              body={student.transported ? 'Aluno transportado.' : 'Sem transporte escolar.'}
            />
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
          Linha do tempo
        </h2>
        {timeline.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            Sem eventos de histórico na API para este aluno.
          </p>
        ) : (
          <ol className="relative mt-6 space-y-6 border-l-2 border-[var(--color-primary)]/30 pl-6">
            {timeline.map((event, index) => (
              <li
                key={event.id}
                className="timeline-enter relative"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="absolute -left-[1.7rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-[var(--color-primary)] shadow" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  {event.date}
                </p>
                <p className="mt-1 font-semibold text-[var(--color-navy)]">{event.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{event.description}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

export function Student360View({ studentId }: { studentId: string }) {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Student360Content studentId={studentId} />
    </Suspense>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-2">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--color-navy)]">{value}</dd>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/60 p-3">
      <p className="text-sm font-semibold text-[var(--color-navy)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{body}</p>
    </li>
  );
}
