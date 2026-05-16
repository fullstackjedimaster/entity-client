//  {
//     "first_name": "",
//     "last_name": "",
//     "employee_number": "",
//     "age": 30,
//     "start_date": "2024-01-01",
//     "is_active": true,
//     "addresses": [
//       {
//         "street": "",
//         "city": "",
//         "state": "",
//         "zip": ""
//       }
//     ]
//   }
// }`;
//
//
// DO $$
// DECLARE
//     v_rag_client_id UUID;
// BEGIN
//
//     INSERT INTO rag.rag_client (
//         name,
//         host_url,
//         collection,
//         llm_model,
//         embed_model,
//         prompt,
//         chaining_mode
//     )
//     VALUES (
//         'iot-wireless-mesh-daq',
//         'https://mesh-daq.fullstackjedi.dev',
//         'mesh_daq_fault_docs',
//         'llama3.2:latest',
//         'nomic-embed-text:latest',
// $$You are a solar diagnostics expert. Use ONLY the provided context to answer.
//
// # Rules
// - If the context does not contain the answer, say Insufficient context.
// - Focus on electrical reasoning.
// - Be concise (<= 6 bullet points).
// - Prefer concrete evidence (numbers, timestamps, MACs).
//
// # Context
// {context}
//
// # Question
// {question}
//
// # Output (bullets)
// - Likely cause(s):
// - Evidence:
// - Remediation:$$,
//         'append'
//     )
//     RETURNING id
//     INTO v_rag_client_id;
//
//
//     INSERT INTO rag.telemetry_message (
//         rag_client_id,
//         message_name,
//         message_value
//     )
//     VALUES
//         (v_rag_client_id, 'status', 0),
//         (v_rag_client_id, 'voltage', 0),
//         (v_rag_client_id, 'current', 0),
//         (v_rag_client_id, 'power', 0),
//         (v_rag_client_id, 'temperature', 0);
//
//
//     RAISE NOTICE 'Created rag_client_id=%', v_rag_client_id;
//
// END $$;
