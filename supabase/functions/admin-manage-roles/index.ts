import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-MANAGE-ROLES] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Authenticate the requesting user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const adminUser = userData.user;
    if (!adminUser) throw new Error("User not authenticated");
    logStep("User authenticated", { adminId: adminUser.id });

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      logStep("Unauthorized: User is not an admin", { userId: adminUser.id });
      throw new Error("Unauthorized: Admin access required");
    }

    logStep("Admin verified");

    // Parse request body
    const { targetUserId, action, role } = await req.json();

    if (!targetUserId || !action || !role) {
      throw new Error("Missing required fields: targetUserId, action, and role");
    }

    // Prevent admins from revoking their own admin role
    if (action === 'revoke' && role === 'admin' && targetUserId === adminUser.id) {
      logStep("Prevented self-revocation", { adminId: adminUser.id });
      throw new Error("Cannot revoke your own admin role");
    }

    logStep("Request parsed", { targetUserId, action, role });

    let result: any = null;
    let actionDetails: any = { action, role };

    if (action === 'grant') {
      // Check if role already exists
      const { data: existingRole } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('role', role)
        .single();

      if (existingRole) {
        logStep("Role already exists", { targetUserId, role });
        throw new Error(`User already has the ${role} role`);
      }

      // Insert new role
      const { data: newRole, error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: targetUserId,
          role: role,
        })
        .select()
        .single();

      if (insertError) {
        logStep("Error inserting role", { error: insertError });
        throw new Error(`Failed to grant role: ${insertError.message}`);
      }

      result = newRole;
      logStep("Role granted successfully", { roleId: newRole.id });

    } else if (action === 'revoke') {
      // Delete the role
      const { data: deletedRole, error: deleteError } = await supabaseClient
        .from('user_roles')
        .delete()
        .eq('user_id', targetUserId)
        .eq('role', role)
        .select()
        .single();

      if (deleteError) {
        logStep("Error deleting role", { error: deleteError });
        throw new Error(`Failed to revoke role: ${deleteError.message}`);
      }

      result = deletedRole;
      logStep("Role revoked successfully", { roleId: deletedRole?.id });

    } else {
      throw new Error("Invalid action. Must be 'grant' or 'revoke'");
    }

    // Log the admin action
    const { error: logError } = await supabaseClient
      .from('admin_actions')
      .insert({
        admin_id: adminUser.id,
        target_user_id: targetUserId,
        action_type: action === 'grant' ? 'grant_role' : 'revoke_role',
        action_details: actionDetails,
      });

    if (logError) {
      logStep("Warning: Failed to log admin action", { error: logError });
      // Don't fail the request if logging fails
    }

    return new Response(JSON.stringify({
      success: true,
      role: result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message.includes("Unauthorized") ? 403 : 500,
    });
  }
});
