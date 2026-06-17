-- Função auxiliar para verificar se o usuário é administrador (SECURITY DEFINER ignora RLS para evitar recursão infinita)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Políticas para profiles
CREATE POLICY "Allow users to read their own profile" ON public.profiles
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Allow users to update their own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Allow admin full access to profiles" ON public.profiles
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 2. Políticas para students
CREATE POLICY "Allow students to read their own data" ON public.students
    FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to update their own data" ON public.students
    FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Allow admin full access to students" ON public.students
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 3. Políticas para courses
CREATE POLICY "Allow authenticated read courses" ON public.courses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin full access to courses" ON public.courses
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 4. Políticas para subjects
CREATE POLICY "Allow authenticated read subjects" ON public.subjects
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin full access to subjects" ON public.subjects
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 5. Políticas para summaries (Resumos em PDF)
CREATE POLICY "Allow read summaries based on plan or access" ON public.summaries
    FOR SELECT TO authenticated USING (
        public.is_admin(auth.uid()) OR
        is_premium = false OR
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = auth.uid() AND s.plan IN ('pro', 'premium')
        ) OR
        EXISTS (
            SELECT 1 FROM public.summary_access sa
            WHERE sa.student_id = auth.uid() AND sa.summary_id = id
        )
    );

CREATE POLICY "Allow admin full access to summaries" ON public.summaries
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 6. Políticas para summary_access
CREATE POLICY "Allow students to read their own access rights" ON public.summary_access
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow admin full access to summary_access" ON public.summary_access
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 7. Políticas para questions
CREATE POLICY "Allow read questions based on plan" ON public.questions
    FOR SELECT TO authenticated USING (
        public.is_admin(auth.uid()) OR
        is_pro_or_premium = false OR
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = auth.uid() AND s.plan IN ('pro', 'premium')
        )
    );

CREATE POLICY "Allow admin full access to questions" ON public.questions
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 8. Políticas para quiz_sessions
CREATE POLICY "Allow students to read their own sessions" ON public.quiz_sessions
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to insert their own sessions" ON public.quiz_sessions
    FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to update their own sessions" ON public.quiz_sessions
    FOR UPDATE TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow admin full access to quiz_sessions" ON public.quiz_sessions
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 9. Políticas para student_answers
CREATE POLICY "Allow students to read their own answers" ON public.student_answers
    FOR SELECT TO authenticated USING (
        public.is_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.quiz_sessions qs
            WHERE qs.id = session_id AND qs.student_id = auth.uid()
        )
    );

CREATE POLICY "Allow students to insert answers to own sessions" ON public.student_answers
    FOR INSERT TO authenticated WITH CHECK (
        public.is_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.quiz_sessions qs
            WHERE qs.id = session_id AND qs.student_id = auth.uid()
        )
    );

CREATE POLICY "Allow admin full access to student_answers" ON public.student_answers
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 10. Políticas para support_messages
CREATE POLICY "Allow students to read their own support thread" ON public.support_messages
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to insert support messages" ON public.support_messages
    FOR INSERT TO authenticated WITH CHECK (
        student_id = auth.uid() OR public.is_admin(auth.uid())
    );

CREATE POLICY "Allow admin full access to support_messages" ON public.support_messages
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 11. Políticas para ai_knowledge_files
CREATE POLICY "Allow admin full access to ai_knowledge_files" ON public.ai_knowledge_files
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 12. Políticas para ai_knowledge_chunks
CREATE POLICY "Allow admin full access to ai_knowledge_chunks" ON public.ai_knowledge_chunks
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 13. Políticas para ai_consultant_access
CREATE POLICY "Allow students to read their own AI access rights" ON public.ai_consultant_access
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow admin full access to ai_consultant_access" ON public.ai_consultant_access
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));


-- 14. Políticas para ai_conversations
CREATE POLICY "Allow students to read their own AI conversations" ON public.ai_conversations
    FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to insert their own AI conversations" ON public.ai_conversations
    FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Allow students to update or delete their own AI conversations" ON public.ai_conversations
    FOR ALL TO authenticated USING (student_id = auth.uid() OR public.is_admin(auth.uid()));


-- 15. Políticas para ai_messages
CREATE POLICY "Allow students to read messages from own conversations" ON public.ai_messages
    FOR SELECT TO authenticated USING (
        public.is_admin(auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.ai_conversations ac
            WHERE ac.id = conversation_id AND ac.student_id = auth.uid()
        )
    );

CREATE POLICY "Allow students to insert messages to own conversations if has access" ON public.ai_messages
    FOR INSERT TO authenticated WITH CHECK (
        public.is_admin(auth.uid()) OR
        (
            EXISTS (
                SELECT 1 FROM public.ai_conversations ac
                WHERE ac.id = conversation_id AND ac.student_id = auth.uid()
            ) AND
            EXISTS (
                SELECT 1 FROM public.ai_consultant_access aica
                WHERE aica.student_id = auth.uid() AND (aica.expires_at IS NULL OR aica.expires_at > now())
            )
        )
    );

CREATE POLICY "Allow admin full access to ai_messages" ON public.ai_messages
    FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
