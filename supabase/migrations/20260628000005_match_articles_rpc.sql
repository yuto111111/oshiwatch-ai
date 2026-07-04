-- RAGチャット用: articles をベクトル類似度検索するRPC関数
create or replace function match_articles(
  query_embedding vector(768),
  match_count integer default 5,
  filter_member_id uuid default null
)
returns table (
  id uuid,
  member_id uuid,
  title text,
  content text,
  source_url text,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query
  select
    a.id,
    a.member_id,
    a.title,
    a.content,
    a.source_url,
    1 - (a.embedding <=> query_embedding) as similarity
  from articles a
  where
    a.embedding is not null
    and (filter_member_id is null or a.member_id = filter_member_id)
  order by a.embedding <=> query_embedding
  limit match_count;
end;
$$;

grant execute on function match_articles(vector(768), integer, uuid) to service_role;
